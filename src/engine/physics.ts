// Simplified orbital mechanics & link-budget physics used by MISSION ARCHITECT.
// All formulas are shown in an optional "Learn more" panel and documented in /docs/ASSUMPTIONS.md.
//
// Constants
export const MU_EARTH = 3.986004418e14 // m^3/s^2
export const MU_MOON = 4.9048695e12
export const MU_MARS = 4.282837e13
export const MU_SUN = 1.32712440018e20
export const R_EARTH = 6378.137 // km
export const R_MOON = 1737.4 // km
export const R_MARS = 3389.5 // km
export const SECONDS_PER_DAY = 86400
export const MINUTES_PER_ORBIT_REF = 90 // LEO reference

// Orbital period: T = 2π * sqrt(a^3 / mu)   (Kepler's third law)
// a = semi-major axis in meters, mu in m^3/s^2, returns T in seconds
export function orbitalPeriodSeconds(aMeters: number, mu: number): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(aMeters, 3) / mu)
}

// Convert altitude (km above body surface) to period in minutes for Earth
export function earthPeriodMinutes(altitudeKm: number): number {
  const a = (R_EARTH + altitudeKm) * 1000 // meters
  return orbitalPeriodSeconds(a, MU_EARTH) / 60
}

// Eclipse fraction for a circular Earth orbit (approximation).
// fraction of orbit in Earth's shadow.
export function eclipseFraction(altitudeKm: number): number {
  // Earth angular radius as seen from orbit: asin(R / (R+h))
  const r = R_EARTH + altitudeKm
  const angle = Math.asin(R_EARTH / r) // radians, half-angle of shadow cone
  // fraction of orbit in eclipse ~ 2*angle / 2pi for circular, sun-terminator aligned
  const frac = (2 * angle) / (2 * Math.PI)
  return Math.max(0, Math.min(1, frac))
}

// Delta-v needed (Tsiolkovsky simplified): we just report required delta-v per orbit.
// rocket equation: delta_v = Isp * g0 * ln(m0 / mf)
// We expose it for the "Learn more" panel; the game uses fixed delta-v per orbit.
export const G0 = 9.80665 // m/s^2
export function tsiolkovskyDeltaV(isps: number, m0: number, mf: number): number {
  return isps * G0 * Math.log(m0 / mf)
}

// Link budget approximation: data rate scales with 1 / distance^2 and antenna gain.
// dataRateFactor is a 0-1 multiplier relative to LEO baseline.
export function linkFactor(distanceKm: number, referenceKm: number = 400): number {
  // inverse square law relative to LEO reference
  return Math.pow(referenceKm / Math.max(distanceKm, referenceKm), 2)
}

// Data volume = rate (GB/day) * duty cycle (0-1)
export function dataVolume(rateGBPerDay: number, dutyCycle: number): number {
  return rateGBPerDay * dutyCycle
}

// Power deficit in eclipse: battery must cover consumed W * eclipse duration (hours)
export function eclipseEnergyWh(powerWatts: number, eclipseMinutes: number): number {
  return (powerWatts * eclipseMinutes) / 60
}
