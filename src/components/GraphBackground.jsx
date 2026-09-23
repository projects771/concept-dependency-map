import React, { useEffect, useRef } from 'react';
import './GraphBackground.css';

/**
 * Dark Vertical Blinds - Interactive WebGL Canvas Backdrop
 * Replicates the realistic satin fluted-glass / vertical blinds reflection
 * with smooth cursor-following illumination and liquid wave refraction.
 */

const VERTEX_SHADER_SRC = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_speed;

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord / u_resolution;

    // Slat dimensions (responsive, approx 22-28px wide)
    float slatWidth = clamp(floor(u_resolution.x / 52.0), 18.0, 28.0);
    
    // Distance from mouse light
    vec2 m = u_mouse;
    vec2 delta = fragCoord - m;
    float dist = length(delta);

    // Smooth outward liquid lens wave refraction following the cursor
    float waveRadius = 340.0;
    float distNorm = dist / waveRadius;
    float dome = exp(-distNorm * distNorm * 2.2);
    float ripple = sin(distNorm * 9.0 - u_time * 2.4) * exp(-distNorm * 2.0);
    float displacement = (dome * 14.0 + ripple * 6.0) * (1.0 + u_speed * 1.5);
    float wave = (delta.x / (dist + 35.0)) * displacement;
    float displacedX = fragCoord.x + wave;

    // Slat coordinates
    float slatCoord = displacedX / slatWidth;
    float u = fract(slatCoord); // [0, 1] across slat
    float slatIndex = floor(slatCoord);

    // Fluted cylindrical curved normal across each vertical slat
    float centerOffset = (u - 0.5) * 2.0; // [-1, 1]
    float nx = centerOffset * 0.75;
    float nz = sqrt(clamp(1.0 - nx * nx, 0.05, 1.0));
    vec3 normal = normalize(vec3(nx, 0.0, nz));

    // Dynamic light at cursor
    vec3 lightPos = vec3(m.x, m.y, 180.0);
    vec3 fragPos3 = vec3(fragCoord.x, fragCoord.y, 0.0);
    vec3 lightDir = normalize(lightPos - fragPos3);
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // Anisotropic vertical highlight along blinds
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 24.0);

    // Elliptical vertical sheen falloff (light stretches vertically along slats)
    float radX = 360.0;
    float radY = 520.0;
    float ellipseDistSq = (delta.x * delta.x) / (radX * radX) + (delta.y * delta.y) / (radY * radY);
    float spotLight = 1.0 / (1.0 + ellipseDistSq * 2.2);

    // Ambient slats structure across whole background
    float ambientRib = 0.04 + 0.035 * (nz * 0.8 + 0.2 * sin(slatIndex * 0.3));
    
    // Deep groove between adjacent slats (beveled shadow)
    float groove = smoothstep(0.0, 0.07, u) * smoothstep(1.0, 0.93, u);
    groove = mix(0.12, 1.0, groove);

    // Slat face bevel highlight (edge catching ambient light)
    float bevelLight = smoothstep(0.05, 0.18, u) * smoothstep(0.4, 0.15, u) * 0.15;

    // Specular and diffuse color combination (refined dark silver/platinum, not blinding)
    vec3 baseDark = vec3(0.045, 0.045, 0.05);
    vec3 silverHighlight = vec3(0.58, 0.60, 0.66);
    vec3 satinSheen = vec3(0.24, 0.26, 0.30);

    // Compose final slat illumination with gentle, controlled specular brightness
    vec3 col = baseDark * (ambientRib + bevelLight) * groove;
    col += (satinSheen * spotLight * 0.32 + silverHighlight * spec * 0.70 * spotLight) * groove;
    col = clamp(col, 0.0, 0.55);

    // Subtle edge vignette
    vec2 vUv = uv * (1.0 - uv.yx);
    float vig = vUv.x * vUv.y * 15.0;
    vig = clamp(pow(vig, 0.2), 0.0, 1.0);
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function GraphBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl', {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      powerPreference: 'high-performance',
    }) || canvas.getContext('experimental-webgl');

    let isFallback = !gl;
    let animId = null;
    let program = null;
    let buffer = null;

    // Uniform locations
    let uResLoc, uMouseLoc, uTimeLoc, uSpeedLoc;

    // Position state
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = window.innerWidth;
    let height = window.innerHeight;

    let currentMouse = { x: width * 0.5 * dpr, y: height * 0.5 * dpr };
    let userTargetMouse = { x: width * 0.5 * dpr, y: height * 0.5 * dpr };
    let lastInteraction = performance.now();
    let smoothedSpeed = 0;
    const startTime = performance.now();

    function updateSize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    if (!isFallback) {
      const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
      const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

      if (!vertShader || !fragShader) {
        isFallback = true;
      } else {
        program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error('Program link error:', gl.getProgramInfoLog(program));
          isFallback = true;
        } else {
          gl.useProgram(program);

          const posLoc = gl.getAttribLocation(program, 'position');
          buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
              -1, -1,
               1, -1,
              -1,  1,
              -1,  1,
               1, -1,
               1,  1
            ]),
            gl.STATIC_DRAW
          );
          gl.enableVertexAttribArray(posLoc);
          gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

          uResLoc = gl.getUniformLocation(program, 'u_resolution');
          uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
          uTimeLoc = gl.getUniformLocation(program, 'u_time');
          uSpeedLoc = gl.getUniformLocation(program, 'u_speed');
        }
      }
    }

    updateSize();

    // Event listeners
    const onPointerMove = (e) => {
      userTargetMouse.x = e.clientX * dpr;
      userTargetMouse.y = (height - e.clientY) * dpr; // WebGL Y is inverted
      lastInteraction = performance.now();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', updateSize);

    // Render loop
    function loop() {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Ambient idle oscillation when no mouse activity
      const idleSec = (now - lastInteraction) * 0.001;
      const idleBlend = Math.min(Math.max((idleSec - 1.5) * 0.8, 0), 1);

      const ambientX = (width * (0.5 + 0.28 * Math.sin(elapsed * 0.45))) * dpr;
      const ambientY = (height * (0.5 + 0.22 * Math.cos(elapsed * 0.35))) * dpr;

      const targetX = userTargetMouse.x * (1 - idleBlend) + ambientX * idleBlend;
      const targetY = userTargetMouse.y * (1 - idleBlend) + ambientY * idleBlend;

      const dx = targetX - currentMouse.x;
      const dy = targetY - currentMouse.y;
      currentMouse.x += dx * 0.08;
      currentMouse.y += dy * 0.08;

      const instSpeed = Math.sqrt(dx * dx + dy * dy);
      smoothedSpeed += (instSpeed - smoothedSpeed) * 0.1;
      const normSpeed = Math.min(smoothedSpeed / (40.0 * dpr), 1.0);

      if (!isFallback && gl) {
        gl.useProgram(program);
        gl.uniform2f(uResLoc, canvas.width, canvas.height);
        gl.uniform2f(uMouseLoc, currentMouse.x, currentMouse.y);
        gl.uniform1f(uTimeLoc, elapsed);
        gl.uniform1f(uSpeedLoc, normSpeed);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else {
        // 2D Canvas Fallback
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const slatW = 24 * dpr;
          const numSlats = Math.ceil(canvas.width / slatW);

          for (let i = 0; i < numSlats; i++) {
            const sx = i * slatW;
            const grad = ctx.createLinearGradient(sx, 0, sx + slatW, 0);
            grad.addColorStop(0, '#060606');
            grad.addColorStop(0.5, '#141414');
            grad.addColorStop(1, '#080808');
            ctx.fillStyle = grad;
            ctx.fillRect(sx, 0, slatW, canvas.height);
          }

          // Mouse spotlight
          const myInverted = canvas.height - currentMouse.y;
          const rad = 400 * dpr;
          const spotGrad = ctx.createRadialGradient(
            currentMouse.x, myInverted, 0,
            currentMouse.x, myInverted, rad
          );
          spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
          spotGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.025)');
          spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = spotGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', updateSize);

      if (gl && program) {
        gl.deleteProgram(program);
      }
      if (gl && buffer) {
        gl.deleteBuffer(buffer);
      }
    };
  }, []);

  return (
    <div className={`gbg ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="gbg-canvas" />
    </div>
  );
}
