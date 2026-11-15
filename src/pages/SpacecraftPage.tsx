import * as React from 'react'
import { useGameStore } from '@/store/gameStore'
import catalogs from '@/engine/catalogs'
import { Button } from '@/ui/components/Button'
import { Card, CardHeader, CardTitle } from '@/ui/components/Button'
import { Satellite, Cpu, Wifi, Wand2, Layout, Sun, Moon, Rocket } from 'lucide-react'
import { SpacecraftBuilder } from '@/ui/visualization/SpacecraftBuilder'

const SUBSYSTEM_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  structure: { label: 'Bus / Structure', icon: Layout },
  power: { label: 'Power System', icon: Sun },
  comms: { label: 'Communications', icon: Wifi },
  computer: { label: 'Onboard Computer', icon: Cpu },
  attitude: { label: 'Attitude Control', icon: Wand2 },
  thermal: { label: 'Thermal Control', icon: Moon },
  propulsion: { label: 'Propulsion', icon: Layout },
}


export function SpacecraftPage() {
  const {
    design, setBusSize, setSubsystem, setInstrument, setPowerArea, setBatteryWh,
    setPhase, recompute,
  } = useGameStore()
  const subsystems: Record<string, any> = catalogs.subsystems
  const instruments: Record<string, any> = catalogs.instruments

  React.useEffect(() => { recompute() }, [recompute])

  const selectedBusChoices = Object.values(subsystems.structure?.choices || {})

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in zoom-in duration-400">
      <div className="flex items-center gap-3 mb-2">
        <Satellite size={26} className="text-nasa-blue" />
        <h2 className="text-2xl font-bold text-white">Phase 2 — Spacecraft & Payload Design</h2>
      </div>
      <p className="text-space-400">Pick your bus size, subsystems, and instruments. Each adds mass, power, cost — and data. Watch the dashboard.</p>

      <SpacecraftBuilder className="mb-5" />

      {/* Bus size */}
      <Card>
        <CardHeader><CardTitle>Bus / Structure</CardTitle></CardHeader>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {selectedBusChoices.map((b: any) => (
            <button
              key={b.id}
              onClick={() => setBusSize(b.id.replace('u','U'))}
              className={`px-5 py-3 rounded-xl border flex flex-col items-center gap-2 transition min-w-[90px] ${
                design.busSize === b.id.replace('u','U')
                  ? 'border-nasa-blue bg-nasa-blue/10 text-white'
                  : 'border-space-600 bg-space-800/30 hover:border-space-500'
              }`}
            >
              <Layout size={20} className={design.busSize === b.id.replace('u','U') ? 'text-white' : 'text-space-400'} />
              <span className="text-xs font-semibold">{b.name.replace(' Bus','')}</span>
              <span className="text-[10px] text-space-500">{b.mass} kg · ${b.cost}M</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-space-500">The bus is your spacecraft's frame. Bigger = more instruments & power, but more mass & cost.</p>
      </Card>

      {/* Subsystems */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(subsystems).map(([cat, sys]) => (
          <Card key={cat}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{SUBSYSTEM_LABELS[cat]?.label || cat}</CardTitle>
              <span className="text-[10px] px-2 py-0.5 rounded bg-space-700 text-xs text-space-400">{sys.id}</span>
            </CardHeader>
            <div className="space-y-2">
              {Object.values(sys.choices).map((c: any) => {
                const selected = design.subsystems[cat]?.id === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setSubsystem(cat, selected ? null : c.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition ${
                      selected
                        ? 'border-emerald-500 bg-emerald-900/30 text-white'
                        : 'border-space-600/50 bg-space-900/50 hover:border-space-500'
                    }`}
                  >
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-[10px] text-space-400 flex justify-between">
                      <span>{c.mass} kg · {c.power} W</span>
                      <span>${c.cost}M</span>
                    </div>
                    <div className="text-[10px] text-space-500 mt-1">{c.tier}</div>
                  </button>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Instruments */}
      <Card>
        <CardHeader><CardTitle>Science Instruments</CardTitle></CardHeader>
        <p className="text-sm text-space-400 mb-3">Add instruments compatible with your objective. Each generates data and consumes power.</p>
        <div className="grid md:grid-cols-4 gap-2">
          {Object.values(instruments).map((inst: any) => {
            const selected = (design.instruments || []).includes(inst.id)
            const objOk = !design.objectiveId || inst.compatibleObjectives.includes(design.objectiveId)
            return (
              <button
                key={inst.id}
                onClick={() => setInstrument(inst.id, !selected)}
                disabled={!objOk}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selected
                    ? 'border-emerald-500 bg-emerald-900/40 text-white'
                    : !objOk
                    ? 'border-space-700/40 bg-space-900/30 text-space-600 cursor-not-allowed opacity-50'
                    : 'border-space-600 bg-space-900/50 hover:border-space-400 hover:bg-space-800 text-white'
                }`}
                title={!objOk ? 'Not compatible with your selected objective' : undefined}
              >
                <div className="font-semibold text-sm">{inst.name}</div>
                <div className="text-[10px] text-space-400 flex justify-between mt-1">
                  <span>{inst.mass} kg · {inst.power} W</span>
                  <span>{inst.dataRate} GB/day</span>
                </div>
              </button>
            )
          })}
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="rounded space-900 border-space-600 text-nasa-blue focus:ring-nasa-blue" />
            <span className="text-xs text-space-400">Select all compatible</span>
          </label>
        </div>
      </Card>

      {/* Power area & battery */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Solar Array Area</CardTitle></CardHeader>
          <div className="flex items-center gap-3">
            <input
              type="range" min="0" max="20" step="1"
              value={design.powerArea} onChange={(e) => setPowerArea(Number(e.target.value))}
              className="flex-1 accent-nasa-blue h-1 bg-space-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono text-white">{design.powerArea} m²</span>
            <span className="text-[10px] text-space-500">≈ {design.powerArea * 130} W</span>
          </div>
          <p className="mt-2 text-xs text-space-500">More area = more power in sunlight, but more mass.</p>
        </Card>
        <Card>
          <CardHeader><CardTitle>Battery Capacity</CardTitle></CardHeader>
          <div className="flex items-center gap-3">
            <input
              type="range" min="0" max="1000" step="25"
              value={design.batteryWh} onChange={(e) => setBatteryWh(Number(e.target.value))}
              className="flex-1 accent-nasa-blue h-1 bg-space-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono text-white">{design.batteryWh} Wh</span>
          </div>
          <p className="mt-2 text-xs text-space-500">Battery must cover the eclipse portion of each orbit.</p>
        </Card>
      </div>

      <div className="mt-1 flex items-center gap-2 text-[11px] text-space-500">
        <span className="flex items-center gap-1"><Sun size={12} className="text-yellow-400" /> solar</span>
        <span className="flex items-center gap-1"><Moon size={12} className="text-space-400" /> eclipse/battery</span>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setPhase('concept')} size="sm">Back</Button>
        <Button onClick={() => setPhase('orbit')} className="ml-auto">
          <Rocket size={18} className="mr-2" /> Continue to Orbit & Launch
        </Button>
      </div>
    </div>
  )
}

export default SpacecraftPage;
