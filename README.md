# MISSION ARCHITECT

**Design, launch, and operate a complete space mission.** A browser-based serious game for the NASA Space Apps Challenge that teaches how real space missions are designed through integrated trade-offs (mass, power, budget, data, communications, orbit, launch vehicle, lifetime). Every decision has visible consequences on other parts of the mission. There is no single perfect solution.

> Public URL (static site): deploy to Netlify / Vercel / GitHub Pages — no install, no login, no signup. Opens and plays in under 10 seconds.

---

## 🎮 What the player does

Follows NASA's real mission-segment backbone (Launch · Space · Ground · User segments) across 8 phases:

1. **Mission Concept** — pick scenario, science objective, requirements
2. **Spacecraft & Payload** — bus, subsystems, instruments (trade study)
3. **Orbit & Launch Vehicle** — with mass/compatibility check (launch is BLOCKED if too heavy)
4. **Ground Segment & Comms** — ground stations, downlink plan
5. **Design Review** — validation; warnings & violated constraints in plain English
6. **Launch** — animated liftoff sequence
7. **Mission Operations** — day-by-day simulation with live graphs + random events
8. **Post-Mission Report** — 0–1000 score, badges, top 3 reasons, improvements, NASA analogue

A **Concept Maturity Level (CML 1→4)** bar advances as phases complete, referencing JPL's CML framework.

---

## 🪐 Mission scenarios (5)
| Scenario | Difficulty | NASA analogue |
|---|---|---|
| Earth Observation CubeSat (wildfire/flood/climate) | Beginner | Landsat / VIIRS |
| Space Telescope (IR / optical / UV / X-ray) | Engineer | Hubble / JWST / Chandra |
| Lunar Orbiter / Lander | Engineer | LRO |
| Mars Orbiter | Mission Director | MRO |
| Sandbox (no objective, no budget cap) | Mission Director | — |

Data is in editable JSON (`src/data/*.json`) — add new scenarios without code changes.

---

## 👥 Single-player AND Team mode (up to 4)

- **Solo:** full game, no backend required
- **Team / hot-seat (same-screen):** roles — Mission Director (budget/schedule/launch approval), Spacecraft Engineer (mass/power/subsystems), Science Lead (objectives/instruments), Comms & Launch Lead (orbit/launch/ground)
- Shared mission state syncs in real time; **negotiation moments** trigger team votes that affect the coordination score
- Zero-backend fallback always works; optional WebSocket (`VITE_MP_WS_URL`) for real-time rooms; graceful offline fallback

---

## 🎯 Judge Mode / Quick Demo

A **"JUDGE MODE / QUICK DEMO"** button on the landing page loads a pre-built Earth-Observation CubeSat mission and plays through design → launch → simulation → report in under 3 minutes.

---

## 🔧 Tech stack
- Vite 5 + React 18 + TypeScript
- Tailwind CSS (dark NASA-inspired theme)
- Zustand (state), three.js + @react-three/fiber (3D orbit view, with CSS fallback)
- recharts (sim graphs), jspdf (PDF export), framer-motion, lucide-react, uuid
- Vitest (7 engine unit tests)

---

## 🚀 Deploy (static site)

### Prerequisites
Node 18+ and npm.

### Install & run locally
```bash
cd mission-architect
npm install
npm run dev        # http://localhost:5173
npm run test       # Vitest engine tests
npm run build      # static output in /dist
npm run preview    # serve /dist locally
```

### One-click deploy
| Platform | Deploy |
|---|---|
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-org/mission-architect) |
| **Vercel** | [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/mission-architect) |
| **GitHub Pages** | Push to `main`, enable Pages in repo settings (static HTML from `/dist`) |

Build command: `npm run build` · Publish directory: `dist` · No server required.

### Environment variables (optional)
- `VITE_MP_WS_URL` — WebSocket URL for real-time multiplayer rooms. Omit for hot-seat/local-only mode (game still fully playable).

---

## 🧪 Judge walkthrough script (2-minute demo)

1. **Open the URL** — game loads in <10s, no login. (Landing page shows "JUDGE MODE / QUICK DEMO".)
2. **Click "JUDGE MODE / QUICK DEMO"** — pre-builds an Earth-Observation CubeSat.
3. **Phase 1–4 (design)** — watch the always-visible resource dashboard: Mass, Power, Budget, Data, Comms, Time turn yellow at 85% and red when exceeded. Add an instrument → mass/power/data rise → need bigger solar/battery → mass grows → bigger launcher → more cost. (Consequence rules in action.)
4. **Phase 5 (Design Review)** — read the plain-English warnings (e.g., *"Your battery is too small to survive the 35-minute eclipse"*). Fix errors; launch is blocked until clean.
5. **Phase 6 (Launch)** — animated liftoff to orbit.
6. **Phase 7 (Operations)** — run the day-by-day sim with live power/battery/data/science graphs; toggle random events (solar flare, ground-station outage).
7. **Phase 8 (Report)** — 0–1000 score with transparent breakdown, badges ("Lean Machine", "Safe Mode Survivor"), PDF download, shareable mission link, compare-with-another-team.

**5 most impressive features to showcase:**
1. Transparent consequence rules engine (one auditable file) — every trade-off ripples across mass/power/budget/data/comms/time.
2. Launch is BLOCKED with a clear error if mass > launcher capacity for the chosen orbit (real constraint).
3. Live day-by-day operations simulation with random events + deterministic seed for reproducibility.
4. Team mode with 4 roles, real-time shared state, and negotiation/vote moments (zero-backend hot-seat fallback).
5. Auto-generated post-mission report: score breakdown, badges, top-3 reasons, improvements, NASA analogue, PDF export, shareable link.

---

## 📂 Project structure
```
src/engine/      rules.ts, physics.ts, simulation.ts, scoring.ts, types.ts, catalogs.ts
src/data/        scenarios.json, instruments.json, orbits.json, launchers.json, subsystems.json, groundStations.json
src/store/       gameStore.ts
src/multiplayer/ types.ts, store.ts, sync.ts, components.tsx, MultiplayerPage.tsx
src/ui/          components/, visualization/
src/pages/       8 phase pages + DataSourcesPage
docs/            ARCHITECTURE.md, ASSUMPTIONS.md
```

## 📄 Data & Sources
See `src/pages/DataSourcesPage.tsx` (in-game) and `docs/ASSUMPTIONS.md` for NASA resource credits and a simplified-vs-real breakdown. Follows NASA Media Usage Guidelines; no NASA logos used.

## License
MIT (or compatible open source). All code original; third-party libraries MIT/Apache/BSD-compatible.
