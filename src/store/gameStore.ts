// MISSION ARCHITECT — Game state store (Zustand)
// Single source of truth for the running mission. Pure data + actions.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  MissionDesign, Phase, Difficulty, Resources, SimState, SimResult,
  ScoreBreakdown, RulesResult,
} from '@/engine/types'
import { evaluateRules } from '@/engine/rules'
import { runSimulation } from '@/engine/simulation'
import { computeScore } from '@/engine/scoring'
import catalogs from '@/engine/catalogs'

// ---------------------------------------------------------------------------
// Load catalogs lazily so the store stays testable
// ---------------------------------------------------------------------------

let _catalogs: any
function getCatalogs() {
  if (!_catalogs) {
    // dynamic import would be async; we load JSON synchronously via vite
    _catalogs = catalogs
  }
  return _catalogs
}

// ---------------------------------------------------------------------------
// Initial design (empty mission)
// ---------------------------------------------------------------------------

const emptyDesign: MissionDesign = {
  scenarioId: 'earth', difficulty: 'Beginner',
  objectiveId: null, requirements: [],
  busSize: null, subsystems: {}, instruments: [], powerArea: 4, batteryWh: 100,
  orbitId: null, launchVehicleId: null,
  groundStations: [], downlinkPlan: '',
  eventsEnabled: true, seed: null,
}

const emptyResources: Resources = {
  mass: { label: 'Mass', used: 0, limit: 5000, unit: 'kg', status: 'ok', why: '' },
  power: { label: 'Power', used: 0, limit: 0, unit: 'W', status: 'ok', why: '' },
  budget: { label: 'Budget', used: 0, limit: 12, unit: '$M', status: 'ok', why: '' },
  data: { label: 'Data', used: 0, limit: 0, unit: 'GB/day', status: 'ok', why: '' },
  comms: { label: 'Comms', used: 0, limit: 10, unit: 'GB/day', status: 'ok', why: '' },
  time: { label: 'Time', used: 0, limit: 18, unit: 'months', status: 'ok', why: '' },
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface GameState {
  // Meta
  phase: Phase
  difficulty: Difficulty
  isJudgeDemo: boolean
  tutorialSeen: boolean
  reducedMotion: boolean
  // Design
  design: MissionDesign
  // Computed
  rules: RulesResult
  resources: Resources
  // Simulation
  sim: SimState | null
  simResult: SimResult | null
  simRunning: boolean
  simSpeed: 1 | 10 | 100
  simDay: number
  // Score / report
  score: ScoreBreakdown | null
  report: string | null
  // Multiplayer (lightweight placeholder)
  multiplayer: { roomCode: string | null; role: string | null; players: any[]; connected: boolean }

  // Actions
  setPhase: (p: Phase) => void
  setDifficulty: (d: Difficulty) => void
  setScenario: (id: string) => void
  setObjective: (id: string | null) => void
  setBusSize: (size: string | null) => void
  setSubsystem: (category: string, choiceId: string | null) => void
  setInstrument: (id: string, checked: boolean) => void
  setPowerArea: (v: number) => void
  setBatteryWh: (v: number) => void
  setOrbit: (id: string | null) => void
  setLaunchVehicle: (id: string | null) => void
  setGroundStations: (ids: string[]) => void
  toggleEvents: () => void
  setSeed: (v: number | null) => void
  recompute: () => void
  runSim: (days: number) => void
  setSimSpeed: (s: 1 | 10 | 100) => void
  generateReport: () => void
  newMission: () => void
  setJudgeDemo: (v: boolean) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'concept',
      difficulty: 'Beginner',
      isJudgeDemo: false,
      tutorialSeen: false,
      reducedMotion: false,
      design: emptyDesign,
      rules: { violations: [], resources: emptyResources, canLaunch: false, cml: 1, phaseCompletion: {} as Record<Phase, boolean> },
      resources: emptyResources,
      sim: null,
      simResult: null,
      simRunning: false,
      simSpeed: 1,
      simDay: 0,
      score: null,
      report: null,
      multiplayer: { roomCode: null, role: null, players: [], connected: false },

      setPhase: (p) => set({ phase: p }),
      setDifficulty: (d) => set({ difficulty: d }),

      setScenario: (id) => {
        set({ design: { ...get().design, scenarioId: id, objectiveId: null, busSize: null, subsystems: {}, instruments: [], orbitId: null, launchVehicleId: null, groundStations: [] }, score: null, report: null, sim: null, simResult: null })
        get().recompute()
      },

      setObjective: (id) => set((state) => {
        const design = { ...state.design, objectiveId: id }
        return { design }
      }, false),
      // recompute called via selector-based listener below

      setBusSize: (size) => set((state) => ({ design: { ...state.design, busSize: size } }), false),
      setSubsystem: (category, choiceId) => set((state) => {
        const subsystems = { ...state.design.subsystems }
        if (choiceId === null) delete subsystems[category]
        else subsystems[category] = { id: choiceId, name: '', tier: 'Simple', mass: 0, power: 0, cost: 0, reliability: 1, description: '', why: '', compatibleWith: [] } as any
        return { design: { ...state.design, subsystems } }
      }, false),
      setInstrument: (id, checked) => set((state) => {
        const instruments = checked
          ? [...(state.design.instruments || []), id]
          : (state.design.instruments || []).filter((x) => x !== id)
        return { design: { ...state.design, instruments } }
      }, false),
      setPowerArea: (v) => set((state) => ({ design: { ...state.design, powerArea: v } }), false),
      setBatteryWh: (v) => set((state) => ({ design: { ...state.design, batteryWh: v } }), false),
      setOrbit: (id) => set((state) => ({ design: { ...state.design, orbitId: id } }), false),
      setLaunchVehicle: (id) => set((state) => ({ design: { ...state.design, launchVehicleId: id } }), false),
      setGroundStations: (ids) => set((state) => ({ design: { ...state.design, groundStations: ids } }), false),
      toggleEvents: () => set((state) => ({ design: { ...state.design, eventsEnabled: !state.design.eventsEnabled } })),
      setSeed: (v) => set((state) => ({ design: { ...state.design, seed: v } })),

      recompute: () => {
        const c = getCatalogs()
        const rules = evaluateRules(get().design, c)
        set({ rules, resources: rules.resources })
      },

      runSim: (days) => {
        const { design } = get()
        const c = getCatalogs()
        const orbit = design.orbitId ? c.orbits[design.orbitId] : null
        const instruments: any[] = (design.instruments || []).map((id) => c.instruments[id]).filter(Boolean)
        const downlink = (design.groundStations || []).reduce((s, id) => s + (c.groundStations[id]?.contactMinutesPerDay ?? 0) * 0.01, 0)
        const result = runSimulation(design, instruments, orbit, downlink, days, design.seed, design.eventsEnabled)
        set({ simResult: result, simDay: result.summary.days, sim: result.states[result.states.length - 1], simRunning: false })
      },

      setSimSpeed: (s) => set({ simSpeed: s }),

      generateReport: () => {
        const { design, rules, simResult } = get()
        if (!simResult) return
        const score = computeScore({ rules, sim: simResult, design })
        set({ score })
        // text report generated in UI layer
      },

      newMission: () => set({ design: emptyDesign, phase: 'concept', score: null, report: null, sim: null, simResult: null }),

      setJudgeDemo: (v) => set({ isJudgeDemo: v }),
    }),
    { name: 'mission-architect-v1', partialize: (s) => ({ design: s.design, tutorialSeen: s.tutorialSeen, reducedMotion: s.reducedMotion }) }
  )
)

// Auto-recompute resources & rules whenever the design changes (live dashboard).
let lastDesign: MissionDesign = emptyDesign
let lastDesignId = 0
useGameStore.subscribe((state) => {
  if (state.design === lastDesign) return
  lastDesign = state.design
  // guard against redundant recomputes
  const now = Date.now()
  if (now - lastDesignId < 80) return
  lastDesignId = now
  // Only recompute if design actually differs from previous (reference changed)
  const rules = evaluateRules(state.design, catalogs as any)
  useGameStore.setState({ rules, resources: rules.resources })
})
// Note: recompute is explicitly called by setters that need it (setScenario). Others rely on explicit recompute calls from UI.
