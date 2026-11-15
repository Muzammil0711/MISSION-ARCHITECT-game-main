# MISSION ARCHITECT — Architecture

## Stack
- **Framework:** Vite 5 + React 18 + TypeScript
- **Styling:** Tailwind CSS (custom NASA-inspired design system via CSS variables)
- **State:** Zustand (single game store + multiplayer store)
- **3D:** three.js + @react-three/fiber + @react-three/drei (with CSS 2D fallback)
- **Charts:** recharts
- **PDF:** jspdf
- **Icons:** lucide-react
- **Animation:** framer-motion
- **Tests:** Vitest (engine rules engine, 7 tests)

## Directory layout
```
src/
  engine/
    types.ts        # shared data model
    physics.ts      # orbital mechanics, link budget, rocket equation
    rules.ts        # transparent consequence rules engine (pure)
    simulation.ts   # day-by-day ops sim, seeded PRNG
    scoring.ts      # 0-1000 score + breakdown
    catalogs.ts     # loads JSON data
  data/
    scenarios.json  # 5 scenarios
    instruments.json# 12 instruments
    orbits.json     # 8 orbits
    launchers.json  # 4 launch vehicles
    subsystems.json # subsystem tiers
    groundStations.json
  store/
    gameStore.ts    # single-player mission state
  multiplayer/
    types.ts        # roles, room, negotiation
    store.ts        # room/player/role state
    sync.ts         # websync with hot-seat fallback
    components.tsx  # room manager, role panels, negotiation
    MultiplayerPage.tsx
  ui/
    components/     # Button, ResourceDashboard, PhaseStepper, DesignReviewPanel, Tooltip
    visualization/  # OrbitScene (3D), SpacecraftBuilder
  pages/            # 8 phase pages + DataSourcesPage
  App.tsx
```

## Data flow
```
User action → Game store setter → auto-recompute (rules engine) → live dashboard
                                          ↓
                                  Design Review → Launch gate (canLaunch)
                                          ↓
                                  Simulation → Report (scoring + badges)
```

## Rules engine (one file)
`src/engine/rules.ts` is a pure, transparent rules engine. It takes `MissionDesign` + catalogs and returns violations, resource status, `canLaunch`, CML level, and phase completion. Unit-tested in `src/engine/rules.test.ts`.

## Multiplayer
- Roles: Mission Director, Spacecraft Engineer, Science Lead, Comms & Launch Lead (up to 4)
- Backend: optional WebSocket (`VITE_MP_WS_URL`); guaranteed fallback = hot-seat same-screen mode
- Negotiation moments with team voting affect coordination score
