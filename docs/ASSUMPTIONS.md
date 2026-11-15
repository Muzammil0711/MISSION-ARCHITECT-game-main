# MISSION ARCHITECT — Simplifying Assumptions

This document lists every simplification the game makes relative to real space-mission engineering, so judges and players can distinguish game mechanics from real physics.

## 1. Orbital mechanics (simplified)
| Concept | Game model | Real-world |
|---|---|---|
| Orbital period | T = 2π√(a³/μ) (Kepler's 3rd, circular orbit) | Same formula, but real orbits are elliptical and perturbed |
| Eclipse | Fraction of orbit in Earth's shadow from geometry | Depends on beta angle, season, orbit orientation |
| Delta-v | Fixed per-orbit value (lookup table) | Computed via mission design software (GMAT) |
| Transfer time | Instantaneous (orbit changed on selection) | Months (Earth→Mars ~7-9 months) |
| N-body effects | None (single central body) | Sun, Moon, planets all perturb |

## 2. Power (simplified)
| Concept | Game model | Real-world |
|---|---|---|
| Solar generation | Area × 130 W/m² (Earth orbit constant) | Varies with distance from Sun, cell efficiency, degradation, pointing |
| Battery | Wh capacity, 80% usable, linear drain | Depth-of-discharge cycles, temperature, chemistry aging |
| Eclipse load | All subsystems draw continuously in eclipse | Some instruments can be power-cycled |

## 3. Communications / data (simplified)
| Concept | Game model | Real-world |
|---|---|---|
| Downlink | Ground-station contact minutes × antenna band rate | Link budget (EIRP, path loss, G/T, modulation, coding, weather) |
| Data rate | Constant per band (UHF/S/X/Ka/dish) | Varies with distance, elevation angle, antenna pointing |
| Storage | Fixed 50 GB onboard, first-in-first-out | Managed by onboard computer, compression, priority queues |
| Light-time delay | None (instant commands) | Mars: 4-24 minutes one-way |

## 4. Reliability / risk (simplified)
| Concept | Game model | Real-world |
|---|---|---|
| Failure probability | (1 - reliability) × radiation factor × (months/12) | Weibull distributions, redundancy, fault trees, FMEA |
| Radiation | Orbit classified low/medium/high | Detailed trapped-particle + solar-event models |
| Safe mode | Battery depletion triggers safe mode | Fault protection with multiple escalation levels |

## 5. Launch (simplified)
| Concept | Game model | Real-world |
|---|---|---|
| Payload capacity | Fixed kg per orbit class per vehicle | Performance curves (C3, inclination, launch site) |
| Reliability | Fixed per-vehicle probability | Statistical over many flights |
| Cost | Fixed $M per launch | Variable, often proprietary |

## 6. Instruments (simplified)
| Concept | Game model | Real-world |
|---|---|---|
| Science value | Fixed 0-100 per instrument per day | Depends on target, integration time, observing mode |
| Data rate | Fixed GB/day | Varies with mode, compression, binning |
| Compatibility | Tag-based (objective → instrument types) | Detailed wavelength, FOV, resolution, heritage |

## 7. Scoring (simplified)
0-1000 score with five weighted categories (success 35%, science 25%, efficiency 15%, risk 15%, coordination/learning 10%). This is a game-design abstraction, not a NASA acceptance criterion.

## 8. Multiplayer (simplified)
Hot-seat same-screen mode is the guaranteed backend-free experience. Real-time room-code mode simulates sync locally and degrades gracefully if no WebSocket server (`VITE_MP_WS_URL`) is configured.

## Formulas used (shown in-game "Learn more")
- Orbital period: T = 2π · √(a³/μ)
- Eclipse energy (Wh): P(W) × eclipse_minutes / 60
- Data volume (GB): rate(GB/day) × duty cycle
- Tsiolkovsky: Δv = Isp · g₀ · ln(m₀/mf)
- Link factor: (reference_distance / distance)²
