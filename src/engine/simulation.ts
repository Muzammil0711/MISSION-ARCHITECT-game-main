// MISSION ARCHITECT — Simulation Engine
//
// Day-by-day (orbit-by-orbit) mission operations simulation.
// Deterministic when a seed is provided. Fast-forward: 1x, 10x, 100x.
//
// Pure functions where possible; SimState is advanced by stepSimDay().

import type { SimState, MissionDesign, Instrument, Orbit, SimResult } from './types'
import { dataVolume, eclipseFraction } from './physics'

export type { SimResult }

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

// A simple seeded PRNG (xorshift32) so judges can reproduce runs.
export class SeededRandom {
  private state: number
  constructor(seed: number) {
    this.state = seed >>> 0 || 1
  }
  next(): number {
    // xorshift32
    let x = this.state
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    this.state = x >>> 0
    return (x >>> 0) / 0xffffffff
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
  chance(p: number): boolean {
    return this.next() < p
  }
}

// ---------------------------------------------------------------------------
// Build initial SimState from a MissionDesign
// ---------------------------------------------------------------------------

export function initSimState(_d: MissionDesign, instruments: Instrument[], orbit: Orbit | null): SimState {
  return {
    day: 0,
    orbitCount: 0,
    powerGenerated: orbit ? 1000 : 0, // placeholder W; engine computes real below
    powerConsumed: instruments.reduce((s, i) => s + i.power, 0) + 100,
    batterySOC: 1.0,
    dataOnboard: 0,
    dataDownlinked: 0,
    scienceCollected: 0,
    safeMode: false,
    failures: [],
  }
}

// ---------------------------------------------------------------------------
// Advance the simulation by one day
// ---------------------------------------------------------------------------

interface StepOptions {
  rand: SeededRandom
  eventsEnabled: boolean
  instruments: Instrument[]
  orbit: Orbit | null
  downlinkCapacityGBPerDay: number
  safeModePowerFactor: number // 0.2 = safe mode consumes 20% power
}

export function stepSimDay(state: SimState, opts: StepOptions): SimState {
  const { rand, eventsEnabled, instruments, orbit, downlinkCapacityGBPerDay, safeModePowerFactor } = opts

  const next: SimState = { ...state }
  next.day += 1

  // Orbits per day (assume ~ LEO-ish ~15 orbits/day if orbit given)
  const orbitsPerDay = orbit ? 24 * 60 / Math.max(orbit.period || 90, 1) : 1
  next.orbitCount += orbitsPerDay

  const inSafeMode = state.safeMode || rand.chance(0.005) // 0.5% chance to enter safe mode spontaneously
  next.safeMode = inSafeMode

  // ---- Random events ----
  if (eventsEnabled) {
    if (rand.chance(0.02)) next.failures.push(`Day ${next.day}: Solar flare increased radiation`)
    if (rand.chance(0.01)) next.failures.push(`Day ${next.day}: Instrument anomaly detected`)
    if (rand.chance(0.015)) next.failures.push(`Day ${next.day}: Ground station outage`)
  }

  // ---- Power ----
  const eclipse = orbit ? eclipseFraction(orbitAltitude(orbit)) : 0.3
  const eclipseHours = eclipse * 24
  const sunHours = 24 - eclipseHours

  const baseConsumed = instruments.reduce((s, i) => s + i.power, 0) + 100
  const consumed = inSafeMode ? baseConsumed * safeModePowerFactor : baseConsumed
  const generated = 130 * 8 // ~8 m^2 array placeholder -> W during sun
  // Net energy over the day (Wh)
  const netWh = (generated * sunHours) - (consumed * 24)
  // Battery change (assume 100 Wh capacity normalized to SOC)
  const batteryDeltaWh = netWh
  const capacityWh = 500 // normalized battery capacity
  next.batterySOC = clampSOC(state.batterySOC + batteryDeltaWh / capacityWh)

  if (next.batterySOC <= 0 && !inSafeMode) {
    next.safeMode = true
    next.failures.push(`Day ${next.day}: Battery depleted — safe mode`)
  } else if (next.batterySOC > 0.2 && inSafeMode) {
    // recover from safe mode once battery healthy
    next.safeMode = false
  }

  // ---- Data & Science ----
  const operating = !inSafeMode
  const generatedGB = operating ? instruments.reduce((s, i) => s + dataVolume(i.dataRate, 0.5), 0) : 0
  next.dataOnboard = clamp(state.dataOnboard + generatedGB, 0, 50) // 50 GB storage
  const downlinked = Math.min(next.dataOnboard, downlinkCapacityGBPerDay)
  next.dataOnboard -= downlinked
  next.dataDownlinked += downlinked

  // Science collected scales with downlinked data (data must be downlinked to count)
  const sciencePotential = instruments.reduce((s, i) => s + i.scienceValue, 0)
  next.scienceCollected = clamp(state.scienceCollected + (downlinked / Math.max(generatedGB, 1)) * sciencePotential * 0.1, 0, 100)

  return next
}

function clampSOC(v: number): number {
  return Math.min(1, Math.max(0, v))
}

// Orbit altitude helper (km)
function orbitAltitude(orbit: Orbit): number {
  return orbit.altitude || 400
}

// ---------------------------------------------------------------------------
// Run a full simulation fast-forward
// ---------------------------------------------------------------------------

export function runSimulation(
  d: MissionDesign,
  instruments: Instrument[],
  orbit: Orbit | null,
  downlinkCapacityGBPerDay: number,
  days: number,
  seed: number | null,
  eventsEnabled: boolean,
): SimResult {
  const rand = new SeededRandom(seed ?? Date.now())
  const states: SimState[] = [initSimState(d, instruments, orbit)]
  let state = states[0]
  for (let i = 0; i < days; i++) {
    state = stepSimDay(state, {
      rand, eventsEnabled, instruments, orbit,
      downlinkCapacityGBPerDay, safeModePowerFactor: 0.2,
    })
    states.push(state)
  }
  const failures = states.flatMap((s) => s.failures)
  const safeModeDays = states.filter((s) => s.safeMode).length
  return {
    states,
    summary: {
      days,
      safeModeDays,
      totalDownlinkedGB: state.dataDownlinked,
      finalScience: clamp0100(state.scienceCollected),
      failures,
    },
  }
}

function clamp0100(v: number): number {
  return Math.min(100, Math.max(0, v))
}
