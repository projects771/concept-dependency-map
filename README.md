# Nodemap update #2 — how to apply

Another **partial, additive update**. Copy these files over the matching
paths in your project (overwrite). Nothing else changes — same repo
structure, same `.env`, same backend/API, same routes.

## FILES TO REPLACE (existing, modified)
- src/styles/index.css          ← **the scroll-bug fix is here**
- src/components/LandingPage.jsx
- src/components/LandingPage.css
- src/components/GraphBackground.css
- src/components/GraphCanvas.jsx
- src/components/GraphCanvas.css
- src/components/EducatorDashboard.jsx

## NEW FILES (add these)
- src/components/GraphAmbientBackground.jsx
- src/components/GraphAmbientBackground.css
- src/components/MiniDependencyChain.jsx
- src/components/MiniDependencyChain.css

## FILES TO KEEP — everything else
`.env`, `package.json`, `package-lock.json`, `vite.config.js`, `index.html`,
`.github/`, `public/`, `src/App.jsx`, `src/main.jsx`, `src/api/api.js`,
`src/hooks/useGraph.js`, `src/context/*`, `Logo.jsx`, `ConceptOrbit.jsx/.css`,
`RoleSelection.jsx/.css`, `CourseJoin.jsx`, `CourseMap.jsx`,
`ConceptNode.jsx/.css`, `Toolbar.*`, `SidePanel.*`, `AddConceptDialog.*`,
`AnalyticsPanel.jsx`, `DeletableEdge.jsx`, `TrailEdge.jsx`, `Auth/*`. No new
npm dependencies — everything here is plain CSS/SVG/React state.

---

## 1. The scrolling bug — root cause & fix

Your `src/styles/index.css` had:

```css
html, body, #root { height: 100%; }
body { ...; overflow: hidden; }
```

`overflow: hidden` on `body`, combined with `height: 100%` everywhere,
locked the *entire document* to one viewport height — so any landing-page
content past the hero was clipped and un-scrollable, exactly what you saw.

The fix:
- `body` no longer has `overflow: hidden`. The page can scroll normally now.
- `.app-shell` (the concept-graph editor wrapper) is now `position: fixed;
  inset: 0; overflow: hidden;` instead of a relative 100%-height box. It's
  now **self-contained** — it fills the viewport and clips its own content
  (the ReactFlow canvas) regardless of whether the body scrolls, so the
  graph editor keeps behaving exactly like before.
- The role-selection / sign-in / course-join / dashboard screens already
  used `.ls-shell { position: fixed; inset: 0; }`, so they were already
  self-contained and needed no change.
- `GraphBackground` (the landing-page knowledge-graph backdrop) switched
  from `position: absolute` to `position: fixed`, so it now stays pinned
  behind the content as you scroll the long landing page, instead of
  stretching to the full page height.

This is the single highest-priority fix in this batch — test it first.

## 2. Landing page — new sections

`LandingPage.jsx` now includes, in order:

1. **Navbar** (unchanged)
2. **Hero** (unchanged — orbit + headline)
3. **Feature cards** (unchanged)
4. **What is Nodemap?** — short explainer paragraph
5. **How Nodemap works** — 4 numbered steps (Map → Learn → Identify gaps →
   Improve) connected by an animated traveling-dot line between them
6. **For students** — bullet list + a small animated dependency chain
   (Arrays → Searching → Graphs → Algorithms)
7. **For educators** — bullet list + a small "class mastery" heatmap of
   concept chips (confident/learning/struggling color-coded)
8. **About Nodemap** — the storytelling section: explains the "why, not
   just completed/not-completed" idea, illustrated by a dependency chain
   (Data Structures → Recursion → Trees → Graph Theory → Graph Algorithms)
   with the first node marked "struggling" and everything downstream
   marked "at risk" — a direct visual of gap propagation
9. **Meet the creators** — contact cards for **Nawal Kishore S Pai**
   (`nawalkishoresatishpai@gmail.com`) and **Gokul B**
   (`gokulb7776@gmail.com`), taken exactly from your reference screenshot,
   each a `mailto:` link with a hover-lift glass card
10. **Footer** (unchanged)

`MiniDependencyChain.jsx` is a small reusable component used in both the
"For students" and "About" sections — a vertical chain of concept nodes
connected by arrows. Pass it a `weakIndex` to mark a node as struggling and
auto-flag everything below it as "at risk"; without one, it gently
auto-cycles which node looks "active" (paused under `prefers-reduced-motion`).

## 3. Concept graph page — ambient background

`GraphAmbientBackground.jsx` is a new decorative layer mounted behind the
ReactFlow canvas in `GraphCanvas.jsx`: a faint dot grid (masked so it fades
toward the edges) plus a soft glow that drifts very slightly toward the
mouse position (throttled with `requestAnimationFrame`, a single
`mousemove` listener, no React re-renders). It's `pointer-events: none` and
sits at a lower z-index than the graph, so panning/zooming/clicking nodes
is completely unaffected. Disabled under `prefers-reduced-motion`.

## 4. Node hover + selection highlighting

`GraphCanvas.jsx` previously only dimmed unrelated nodes/edges when a node
was **selected**. It now does the same thing on **hover** too (selection
still takes priority if something is selected) — hovering a concept now
raises it (existing CSS), highlights its direct dependencies, and dims the
rest of the graph, exactly per your spec. This uses ReactFlow's built-in
`onNodeMouseEnter`/`onNodeMouseLeave` props — no new dependency.

## 5. Educator dashboard — course cards

Course list items were inline-styled `<li>`s; they're now a `.edu-course-card`
class with a hover lift + border glow + shadow, defined in
`src/styles/index.css`. No behavioral change — same links, same copy-code
button, same student count.

---

## What I did NOT touch in this pass

- Role-selection cards, course-join screen, and `ConceptOrbit` were already
  updated in the previous batch and are untouched here.
- Toolbar, SidePanel, AddConceptDialog, AnalyticsPanel — not touched.
- No parallax/mouse response was added to the *landing page* background
  (only the graph page) to avoid overloading the already-content-heavy
  scrolling page with motion; let me know if you want that too.

## Install & verify

```bash
npm install
npm run dev
```

Checklist:
- [ ] Landing page scrolls all the way to the footer, mouse wheel and
      trackpad both work, no clipped content
- [ ] Concept-graph editor still fills the screen with no page-level
      scrollbar (it's a fixed, self-contained view)
- [ ] Hovering a node in the graph dims unrelated nodes/edges
- [ ] Creators section shows the correct names/emails and `mailto:` links open your mail client
- [ ] Existing auth/course flows still work unchanged

Then:

```bash
npm run build
```

`vite.config.js`'s `base: '/concept-dependency-map/'` wasn't touched, so
GitHub Pages deployment is unaffected — commit source (and `dist/` if your
Pages workflow serves it directly instead of building on push) and push to
`main`.
