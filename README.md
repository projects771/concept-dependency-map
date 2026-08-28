# Nodemap UI/UX update — how to apply

This is a **partial update**: only the files listed below changed. Everything
else in your project (auth, API, hooks, dagre layout, package.json, vite
config, .env, dashboards' data logic, etc.) is untouched — copy these files
over the matching paths in your existing `src/components/` folder and you're
done. Do NOT delete your project and start over; just overwrite these files.

## FILES TO REPLACE (existing files, modified)
- src/components/LandingPage.jsx
- src/components/RoleSelection.jsx
- src/components/GraphCanvas.jsx
- src/components/GraphCanvas.css
- src/components/ConceptNode.css
- src/components/CourseMap.jsx
- src/components/CourseJoin.jsx
- src/components/EducatorDashboard.jsx

## NEW FILES (add these)
- src/components/GraphBackground.jsx
- src/components/GraphBackground.css
- src/components/ConceptOrbit.jsx
- src/components/ConceptOrbit.css
- src/components/LandingPage.css
- src/components/RoleSelection.css

## FILES TO KEEP (not touched at all)
Everything else: `.env`, `package.json`, `package-lock.json`,
`vite.config.js`, `index.html`, `docx.html`, `.github/`, `public/`,
`src/App.jsx`, `src/main.jsx`, `src/styles/index.css`, `src/api/api.js`,
`src/hooks/useGraph.js`, `src/context/*`, `src/components/Logo.jsx`,
`src/components/Toolbar.jsx` + `.css`, `src/components/SidePanel.jsx` +
`.css`, `src/components/ConceptNode.jsx`, `src/components/AddConceptDialog.*`,
`src/components/AnalyticsPanel.jsx`, `src/components/DeletableEdge.jsx`,
`src/components/TrailEdge.jsx`, `src/components/Auth/*`,
`src/components/LandingScreen.jsx` + `.css` (this appears to be an older,
unused screen — it's not referenced by any route in App.jsx, so it was left
alone; safe to delete later if you confirm it's dead code).

No `package.json` changes were needed — everything below uses only CSS/SVG
that ships with the browser, so **no new dependencies were added**.

---

## What changed and why

**1. `GraphBackground.jsx`/`.css`** — new reusable component: a quiet
animated knowledge-graph backdrop (drifting nodes, connecting lines, a
few light pulses traveling along some edges). Mounted behind the landing
page, role-selection screen, educator dashboard, and course-join screen.
It's `position: absolute`, `pointer-events: none`, and respects
`prefers-reduced-motion`, so it never interferes with clicks or a11y.

**2. `ConceptOrbit.jsx`/`.css`** — the hero interaction on the landing
page: a central "Data Structures" node with six related concepts
(Arrays, Recursion, Trees, Graphs, Sorting, Dynamic Programming) orbiting
around it on connecting spokes. Built with two opposing CSS rotations
(the ring rotates, the cards counter-rotate) so it stays upright and
never needs a JS animation loop — cheap on CPU/battery. Pauses on hover.

**3. `LandingPage.jsx`/`.css`** — rebuilt off inline styles into a real
stylesheet: glass/blurred sticky nav, the orbit hero, and premium
feature cards with hover lift. Content and links are unchanged (still
routes to `/join`).

**4. `RoleSelection.jsx`/`.css`** — same functionality (pick
educator/student, continue to sign-in), rebuilt with real CSS, a
graph background, and hover-reveal pill tags under each role card
(Courses/Class analytics/Knowledge graphs for educators; Learning
paths/Concept mastery/Knowledge gaps for students) per your spec.

**5. `GraphCanvas.jsx`/`.css` + `ConceptNode.css`** — when a node is
selected, connected nodes/edges are now computed (`useMemo`) and the
rest of the graph dims (opacity + slight grayscale) while the selected
node gets a colored glow and its direct edges highlight and animate
(ReactFlow's built‑in dashed "flow" animation, orange accent, glow).
This is purely additive — existing zoom, minimap, node drag, edge
delete, and add-concept behavior are all untouched.

**6. `CourseMap.jsx`** — one-line change: passes `selectedNodeId` down
to `GraphCanvas` so it knows what's selected. No behavior change
otherwise.

**7. `CourseJoin.jsx` / `EducatorDashboard.jsx`** — added the animated
background behind the existing card layout and made the card
semi-transparent + blurred (glass) so the background reads through.
All existing logic (join by code, create course, share code, etc.)
is untouched.

---

## Install & run

```bash
npm install
npm run dev
```

Verify at the local dev URL, then:

```bash
npm run build
```

This regenerates `dist/` from source (Vite `base` in `vite.config.js` is
already `/concept-dependency-map/`, which is correct for GitHub Pages —
I didn't need to touch it).

## Deploy

Commit the changed/new files above (and the regenerated `dist/` if your
GitHub Pages deployment serves `dist/` directly from the repo — check your
`.github/workflows` deploy action; if it builds on push instead, you only
need to commit source). Push to `main`. Your existing GitHub Actions
workflow will publish to:
https://projects771.github.io/concept-dependency-map/

## What I did NOT change in this pass

To keep this a safe, reviewable diff rather than a risky rewrite, I did not
touch: the concept-map editing toolbar, side panel, analytics panel, add-
concept dialog, sign-in/register screens, auth context, or the dagre
auto-layout logic. If you want the same treatment (animated background +
polish) applied to those screens next, say the word and I'll do another
focused pass — happy to keep going file by file rather than one giant drop.
