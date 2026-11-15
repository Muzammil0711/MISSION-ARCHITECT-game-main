// Shared TypeScript types for MISSION ARCHITECT
// Single source of truth for the mission design data model.

export type Difficulty = 'Beginner' | 'Engineer' | 'MissionDirector' | string
export type Phase = 'landing' | 'concept' | 'spacecraft' | 'orbit' | 'ground' | 'review' | 'launch' | 'operations' | 'report' | 'datasources' | 'multiplayer'
export type CML = 1 | 2 | 3 | 4

export interface Vector3 {
  x: number
  y: number
  z: number
}

// ---------- Resources (live dashboard) ----------
export interface Resources {
  mass: ResourceLine        // kg
  power: ResourceLine       // W generated vs consumed
  budget: ResourceLine      // $M
  data: ResourceLine        // GB/day generated vs downlink/day
  comms: ResourceLine       // data rate / contact time
  time: ResourceLine        // dev months + lifetime
}

export interface ResourceLine {
  label: string
  used: number
  limit: number
  unit: string
  // status computed by engine: 'ok' | 'warning' | 'exceeded'
  status: 'ok' | 'warning' | 'exceeded'
  // plain-english explanation
  why: string
}

// ---------- Subsystem tiers ----------
export type Tier = 'Simple' | 'Advanced'

export interface SubsystemChoice {
  id: string
  name: string
  tier: Tier
  mass: number      // kg
  power: number     // W (continuous draw)
  cost: number      // $M
  reliability: number // 0-1 (probability of not failing over lifetime)
  description: string
  why: string       // plain English
  compatibleWith: string[] // scenario IDs it works with
  disabled?: boolean
  disabledReason?: string
}

// ---------- Science instruments ----------
export interface Instrument {
  id: string
  name: string
  type: 'camera' | 'multispectral' | 'spectrometer' | 'radar' | 'magnetometer' | 'ir' | 'uv' | 'xray'
  mass: number      // kg
  power: number     // W
  cost: number      // $M
  dataRate: number  // GB/day when operating
  scienceValue: number // 0-100 per day contribution
  compatibleObjectives: string[] // objective IDs
  description: string
  why: string
  disabled?: boolean
  disabledReason?: string
}

// ---------- Orbits ----------
export interface Orbit {
  id: string
  name: string
  altitude: number  // km above surface (for Earth) or semi-major axis
  body: 'earth' | 'moon' | 'mars' | 'sun'
  period: number    // minutes (computed)
  eclipseFraction: number // 0-1 fraction of orbit in shadow
  coverage: string  // plain English
  radiation: 'low' | 'medium' | 'high'
  lifetimeMonths: number
  deltaV: number    // m/s needed to reach/maintain
  dataRateFactor: number // comms effectiveness multiplier (1 = baseline LEO)
  description: string
  why: string
  compatibleWith: string[] // scenario IDs
  launchVehicleMassLimit: number // max payload kg this orbit needs from launcher
}

// ---------- Launch vehicles ----------
export interface LaunchVehicle {
  id: string
  name: string
  class: 'small' | 'medium' | 'heavy'
  cost: number      // $M
  reliability: number // 0-1
  // payload capacity to orbit (kg) - keyed by orbit class
  payloadToLEO: number
  payloadToGTO: number
  payloadToBeyond: number // lunar/mars/l2
  description: string
  why: string
}

// ---------- Scenarios ----------
export interface Scenario {
  id: string
  name: string
  shortName: string
  difficulty: Difficulty
  body: 'earth' | 'moon' | 'mars' | 'asteroid'
  objective: string
  objectives: Objective[]
  minScienceReturn: number // 0-100
  budgetCap: number        // $M
  durationMonths: number   // operational lifetime target
  nasaAnalog: string       // real mission it resembles
  nasaLink: string
  description: string
  why: string
  startingBudget: number   // $M
}

// ---------- Objectives ----------
export interface Objective {
  id: string
  name: string
  description: string
  scienceWeight: number    // how much this objective contributes to science score
  requiredInstruments: string[] // instrument type IDs needed
  minCoverage: number      // 0-1
}

// ---------- Ground stations ----------
export interface GroundStation {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  bands: string[] // e.g. ['S','X','Ka']
  contactMinutesPerDay: number
  cost: number // $M to add
  reliability: number
}

// ---------- Mission state (the shared mutable state) ----------
export interface MissionDesign {
  scenarioId: string
  difficulty: Difficulty
  // Phase 1
  objectiveId: string | null
  requirements: string[]
  // Phase 2
  busSize: string | null // '3U' | '6U' | '12U' | 'smallsat' | 'medium' | 'large'
  subsystems: Record<string, SubsystemChoice> // subsystemId -> choice
  instruments: string[] // instrument ids selected
  powerArea: number // solar array m^2
  batteryWh: number
  // Phase 3
  orbitId: string | null
  launchVehicleId: string | null
  // Phase 4
  groundStations: string[] // station ids
  downlinkPlan: string
  // Phase 5 (review) computed
  // Phase 7 operations
  eventsEnabled: boolean
  seed: number | null
}

// ---------- Simulation ----------
export interface SimState {
  day: number
  orbitCount: number
  powerGenerated: number // W
  powerConsumed: number // W
  batterySOC: number // 0-1
  dataOnboard: number // GB
  dataDownlinked: number // GB
  scienceCollected: number // 0-100
  safeMode: boolean
  failures: string[]
}

export interface SimResult {
  states: SimState[]
  summary: {
    days: number
    safeModeDays: number
    totalDownlinkedGB: number
    finalScience: number
    failures: string[]
  }
}

// ---------- Rules engine results ----------
export interface RuleViolation {
  id: string
  phase: Phase
  severity: 'info' | 'warning' | 'error'
  title: string
  message: string // plain English
  fix: string // suggested fix
  resource?: string
}

export interface RulesResult {
  violations: RuleViolation[]
  resources: Resources
  canLaunch: boolean
  launchError?: string
  cml: CML
  phaseCompletion: Record<Phase, boolean>
}

// ---------- Scoring ----------
export interface ScoreBreakdown {
  total: number // 0-1000
  success: number // 35%
  science: number // 25%
  efficiency: number // 15%
  risk: number // 15%
  collab: number // 10%
  details: string[]
}

export interface Badge {
  id: string
  name: string
  description: string
  earned: boolean
}
