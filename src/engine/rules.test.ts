import { describe, it, expect } from 'vitest'
import { evaluateRules } from '../engine/rules'
import { BUS_MASS } from '../engine/rules'

// Build a minimal catalog for testing
const catalogs = {
  scenarios: {
    earth: {
      id: 'earth', name: 'Earth Observation', shortName: 'EO', difficulty: 'Beginner' as const,
      body: 'earth', objective: 'Monitor wildfires',
      objectives: [{ id: 'obj1', name: 'Wildfire monitoring', description: '', scienceWeight: 1,
        requiredInstruments: ['camera', 'multispectral'], minCoverage: 0.5 }],
      minScienceReturn: 50, budgetCap: 10, durationMonths: 12, nasaAnalog: 'Landsat', nasaLink: '',
      description: '', why: '', startingBudget: 10,
    },
  },
  orbits: {
    leo: { id: 'leo', name: 'Low Earth Orbit', altitude: 400, body: 'earth', period: 90,
      eclipseFraction: 0.35, coverage: 'Global', radiation: 'low', lifetimeMonths: 24,
      deltaV: 9400, dataRateFactor: 1.0, description: '', why: '', compatibleWith: ['earth'],
      launchVehicleMassLimit: 5000 },
    geo: { id: 'geo', name: 'GEO', altitude: 35786, body: 'earth', period: 1436,
      eclipseFraction: 0.1, coverage: 'Fixed region', radiation: 'medium', lifetimeMonths: 120,
      deltaV: 12000, dataRateFactor: 0.5, description: '', why: '', compatibleWith: ['earth'],
      launchVehicleMassLimit: 5000 },
  },
  launchers: {
    small: { id: 'small', name: 'Small Launcher', class: 'small', cost: 10, reliability: 0.95,
      payloadToLEO: 300, payloadToGTO: 100, payloadToBeyond: 50, description: '', why: '' },
    heavy: { id: 'heavy', name: 'Heavy Launcher', class: 'heavy', cost: 80, reliability: 0.98,
      payloadToLEO: 5000, payloadToGTO: 2000, payloadToBeyond: 1000, description: '', why: '' },
  },
  instruments: {
    cam: { id: 'cam', name: 'Camera', type: 'camera', mass: 5, power: 10, cost: 1,
      dataRate: 2, scienceValue: 20, compatibleObjectives: ['obj1'], description: '', why: '' },
    spec: { id: 'spec', name: 'Spectrometer', type: 'spectrometer', mass: 15, power: 40, cost: 5,
      dataRate: 10, scienceValue: 50, compatibleObjectives: [], description: '', why: '' },
  },
  subsystems: {
    coms: { id: 'coms', name: 'S-band radio', tier: 'Simple', mass: 3, power: 20, cost: 2,
      reliability: 0.99, description: '', why: '', compatibleWith: [] },
  },
  groundStations: {
    gs1: { cost: 1, contactMinutesPerDay: 120 },
  },
} as any

function baseDesign() {
  return {
    scenarioId: 'earth', difficulty: 'Beginner' as const,
    objectiveId: 'obj1', requirements: [],
    busSize: '6U', subsystems: { coms: catalogs.subsystems.coms },
    instruments: ['cam'], powerArea: 4, batteryWh: 200,
    orbitId: 'leo', launchVehicleId: 'heavy',
    groundStations: ['gs1'], downlinkPlan: '', eventsEnabled: false, seed: null,
  }
}

describe('Rules engine', () => {
  it('passes a valid design and allows launch', () => {
    const res = evaluateRules(baseDesign(), catalogs)
    expect(res.canLaunch).toBe(true)
    expect(res.launchError).toBeUndefined()
    expect(res.violations.filter((v) => v.severity === 'error')).toHaveLength(0)
  })

  it('blocks launch when mass exceeds launcher capacity', () => {
    const d = baseDesign()
    d.launchVehicleId = 'small' // 300 kg to LEO
    d.busSize = 'large' // 1500 kg bus -> exceeds
    const res = evaluateRules(d, catalogs)
    expect(res.canLaunch).toBe(false)
    const err = res.violations.find((v) => v.id === 'orb-mass-exceeds')
    expect(err).toBeDefined()
    expect(err?.severity).toBe('error')
    expect(res.resources.mass.status).toBe('exceeded')
  })

  it('flags budget overrun', () => {
    const d = baseDesign()
    d.instruments = ['cam', 'spec', 'spec'] // expensive
    const res = evaluateRules(d, catalogs)
    const over = res.violations.find((v) => v.id === 'budget-over')
    if (over) expect(over.severity).toBe('error')
    // budgetLine exceeded check
    expect(res.resources.budget.status).toBe('exceeded')
  })

  it('flags power deficit', () => {
    const d = baseDesign()
    d.powerArea = 0 // no generation
    const res = evaluateRules(d, catalogs)
    const deficit = res.violations.find((v) => v.id === 'pwr-deficit')
    expect(deficit).toBeDefined()
    expect(res.resources.power.status).toBe('exceeded')
  })

  it('flags data backlog', () => {
    const d = baseDesign()
    d.instruments = ['cam', 'spec', 'spec', 'spec']
    d.groundStations = [] // no downlink
    const res = evaluateRules(d, catalogs)
    const backlog = res.violations.find((v) => v.id === 'data-backlog')
    expect(backlog).toBeDefined()
  })

  it('computes CML', () => {
    const d = baseDesign()
    const res = evaluateRules(d, catalogs)
    expect(res.cml).toBeGreaterThanOrEqual(1)
    expect(res.cml).toBeLessThanOrEqual(4)
    expect(typeof res.phaseCompletion.concept).toBe('boolean')
  })

  it('BUS_MASS lookup is present', () => {
    expect(BUS_MASS['6U']).toBe(12)
  })
})
