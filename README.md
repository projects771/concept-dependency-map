# Nodemap — Concept Dependency Map

An interactive knowledge-dependency mapping platform. Courses are modeled
as a connected graph of concepts and prerequisites: students see exactly
which gaps are blocking their progress, and educators see class-wide
weaknesses in one view.

Live: https://projects771.github.io/concept-dependency-map/

## Stack

- **Frontend**: React 18 + Vite 5 (this repo)
- **Routing**: React Router v7
- **Graph canvas**: React Flow 11 + `@dagrejs/dagre` for auto-layout
- **Auth**: email/password + Google OAuth (`@react-oauth/google`)
- **Backend**: a separate service (not in this repo) — the frontend talks
  to it over REST via `src/api/api.js`, configured with `VITE_API_URL`

## Run it locally

```bash
npm install
npm run dev
```

You'll need a `.env` file (not committed) with at least:

```
VITE_API_URL=<your backend's base URL>
VITE_GOOGLE_CLIENT_ID=<your Google OAuth client ID>
```

The app requires a real backend to be reachable at `VITE_API_URL` — there
is no mock-data mode in the current build.

### Build & preview

```bash
npm run build
npm run preview
```

### Deploy

`vite.config.js` sets `base: '/concept-dependency-map/'` for GitHub Pages.
Pushing to `main` triggers the workflow in `.github/workflows`, which
builds and publishes `dist/`.

## Project structure

```
src/
├── api/api.js              # all backend calls
├── components/
│   ├── Auth/                # SignIn, Register
│   ├── LandingPage.jsx      # marketing landing page
│   ├── RoleSelection.jsx    # "Educator or Student?" onboarding
│   ├── CourseJoin.jsx       # student dashboard: join by code + enrolled list
│   ├── EducatorDashboard.jsx
│   ├── CourseMap.jsx        # container for the graph view
│   ├── GraphCanvas.jsx      # React Flow wrapper + node/edge highlighting
│   ├── ConceptNode.jsx      # custom node renderer (160×44px)
│   ├── SidePanel.jsx        # node detail / mastery panel
│   ├── Toolbar.jsx          # graph toolbar
│   ├── AnalyticsPanel.jsx   # educator class analytics
│   └── GraphBackground.jsx, GraphAmbientBackground.jsx, ConceptOrbit.jsx
│                             # decorative knowledge-graph backgrounds
├── context/                  # Auth, Role, Toast providers
├── hooks/useGraph.js         # graph state, persistence, layout, gap analysis
└── styles/index.css          # design tokens + base component styles
```

## Roles & flow

1. Visitor lands on **`/`**.
2. Picks **Educator** or **Student** at **`/join`**.
3. Signs in (email/password or Google) at **`/signin`** or **`/register`**.
4. **Educator** → `/dashboard` → creates/edits courses → `/course/:id/edit`
   (full graph editor: add concepts, connect dependencies, auto-layout).
5. **Student** → `/student/join` → enters a course code → `/course/:id`
   (read-only graph + mastery self-tracking + gap-risk highlighting).

## Design system

Dark, warm-charcoal background with a coral/orange primary accent and
indigo/violet secondary accents. Tokens (spacing, radius, shadows, colors)
live at the top of `src/styles/index.css`. `GraphBackground` /
`GraphAmbientBackground` provide the knowledge-graph-style backdrop used
consistently across every full-screen view (landing, auth, onboarding,
dashboards, and the graph canvas itself).

## Contributing

Open a PR against `main`; the CI workflow builds automatically on push.
Please don't commit `node_modules/` or `.env`.
