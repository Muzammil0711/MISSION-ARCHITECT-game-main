import * as React from 'react'
import { useGameStore } from '@/store/gameStore'
import catalogs from '@/engine/catalogs'
import { Button, Card, CardHeader, CardTitle } from '@/ui/components/Button'
import { Tooltip } from '@/ui/components/Tooltip'
import { Rocket, Orbit as OrbitIcon, AlertTriangle, ShieldAlert } from 'lucide-react'
import { OrbitScene } from '@/ui/visualization/OrbitScene'

export function OrbitPage() {
  const { design, setOrbit, setLaunchVehicle, setPhase, recompute, rules } = useGameStore()
  const orbits: Record<string, any> = catalogs.orbits
  const launchers: Record<string, any> = catalogs.launchers

  React.useEffect(() => { recompute() }, [recompute])

  const orbitIds = Object.keys(orbits)
  const launcherIds = Object.keys(launchers)

  const massLine = rules.resources.mass
  const canLaunch = rules.canLaunch

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in zoom-in duration-400">
      <div className="flex items-center gap-3 mb-2">
        <OrbitIcon size={26} className="text-nasa-blue" />
        <h2 className="text-2xl font-bold text-white">Phase 3 — Orbit & Launch Vehicle</h2>
      </div>
      <p className="text-space-400">Choose your orbit and launch vehicle. Your spacecraft's mass must fit the launcher's capacity for that orbit — otherwise launch is BLOCKED.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Orbit */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Orbit</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {orbitIds.map((id) => {
              const o = orbits[id]
              const selected = design.orbitId === id
              return (
                <button
                  key={id}
                  onClick={() => setOrbit(id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selected
                      ? 'border-nasa-blue bg-nasa-blue/10 text-white'
                      : 'border-space-600/50 bg-space-900/50 hover:border-space-400 hover:bg-space-800'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-semibold">{o.name}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      o.radiation === 'low' ? 'bg-emerald-900 text-emerald-300' :
                      o.radiation === 'medium' || o.radiation === 'low-medium' ? 'bg-amber-900 text-amber-300' :
                      'bg-red-900 text-red-300'
                    }`}>{o.radiation} radiation</span>
                  </div>
                  <div className="text-[10px] text-space-400 mt-1 flex gap-2">
                    <span>{o.altitude} km</span>
                    <span>· {o.period} min period</span>
                    <span>· {o.deltaV.toLocaleString()} m/s Δv</span>
                  </div>
                  <Tooltip label={o.name} description={o.why}>
                    <span className="text-xs text-space-500 mt-2 block">{o.description}</span>
                  </Tooltip>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Launcher */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Launch Vehicle</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {launcherIds.map((id) => {
              const lv = launchers[id]
              const selected = design.launchVehicleId === id
              const orbit = orbits[design.orbitId || 'leo']
              const capacity = orbit ? (orbit.name.toLowerCase().includes('leo')||orbit.name.toLowerCase().includes('sun') ? lv.payloadToLEO :
                orbit.name.toLowerCase().includes('geo')||orbit.name.toLowerCase().includes('meo')||orbit.name.toLowerCase().includes('heo') ? lv.payloadToGTO : lv.payloadToBeyond) : lv.payloadToLEO
              return (
                <button
                  key={id}
                  onClick={() => setLaunchVehicle(id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selected
                      ? 'border-nasa-blue bg-nasa-blue/10 text-white'
                      : 'border-space-600/50 bg-space-900/50 hover:border-space-400 hover:bg-space-800'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-semibold">{lv.name}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-space-700 text-space-400`}>${lv.class}</span>
                  </div>
                  <div className="text-[10px] text-space-400 mt-1 flex gap-2">
                    <span>Cap: {capacity.toLocaleString()} kg</span>
                    <span>· ${lv.cost}M</span>
                    <span>· {(lv.reliability*100).toFixed(0)}% reliable</span>
                  </div>
                  <div className="text-xs text-space-500 mt-1">{lv.description}</div>
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Compatibility / mass check */}
      <Card className="border-space-600">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={16} className={canLaunch ? 'text-emerald-500' : 'text-amber-500'} />
            <span className={`font-semibold text-sm ${canLaunch ? 'text-emerald-400' : 'text-amber-400'}`}>
              {canLaunch ? 'Launch compatible' : 'Mass vs capacity check'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-space-400">Spacecraft mass</span>
            <span className={`font-mono ${massLine.status === 'exceeded' ? 'text-red-400' : massLine.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {massLine.used.toFixed(0)} kg
            </span>
          </div>
          {design.orbitId && design.launchVehicleId && (
            <div className="text-xs text-space-500 mt-2">
              Launcher capacity for {orbits[design.orbitId].name}: capacity checked by engine.
            </div>
          )}
          {massLine.status === 'exceeded' && (
            <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-200">
              <AlertTriangle size={14} className="mr-2 mt-0.5" /> Spacecraft too heavy for this launcher/orbit — reduce mass or choose a bigger rocket.
            </div>
          )}
        </div>
      </Card>
      <div className="mt-1 flex items-center justify-center">
        <OrbitScene body="earth" className="w-full max-w-md h-64" />
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setPhase('spacecraft')} size="sm">Back</Button>
        <Button
          onClick={() => setPhase('ground')}
          disabled={!design.orbitId || !design.launchVehicleId}
          className="ml-auto"
        >
          <Rocket size={18} className="mr-2" /> Continue to Ground Segment
        </Button>
      </div>
      {!design.orbitId || !design.launchVehicleId && (
        <p className="text-xs text-space-500 mt-2">Select both an orbit and a launch vehicle to continue.</p>
      )}
    </div>
  )
}

export default OrbitPage;
