// Catalog loader: bundles all game data JSON.
// Kept separate so the engine stays pure and data is editable without code changes.

import scenarios from '@/data/scenarios.json'
import instruments from '@/data/instruments.json'
import orbits from '@/data/orbits.json'
import launchers from '@/data/launchers.json'
import subsystems from '@/data/subsystems.json'
import groundStations from '@/data/groundStations.json'

export default {
  scenarios, instruments, orbits, launchers, subsystems, groundStations,
}
