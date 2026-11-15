import * as React from 'react'
import { useGameStore } from '@/store/gameStore'
import catalogs from '@/engine/catalogs'
import { Button, Card } from '@/ui/components/Button'
import { Wifi, Database, Globe } from 'lucide-react'

export function GroundPage() {
  const { design, setGroundStations, setPhase, recompute } = useGameStore()
  const stations = catalogs.groundStations

  React.useEffect(() => { recompute() }, [recompute])

  const selected = new Set(design.groundStations || [])
  const downlink = Object.entries(stations).reduce((s, [id, st]: any) =>
    s + (selected.has(id) ? st.contactMinutesPerDay : 0), 0)

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in zoom-in duration-400">
      <div className="flex items-center gap-3 mb-2">
        <Globe size={26} className="text-nasa-blue" />
        <h2 className="text-2xl font-bold text-white">Phase 4 — Ground Segment & Comms</h2>
      </div>
      <p className="text-space-400">Choose ground stations to downlink your science data. More stations = more contact time = less data lost.</p>

      <div className="grid md:grid-cols-3 gap-3">
        {Object.entries(stations).map(([id, st]: any) => {
          const checked = selected.has(id)
          return (
            <Card key={id} className={`cursor-pointer border transition ${checked ? 'border-emerald-500 bg-emerald-900/20' : 'border-space-600 hover:border-space-400'}`} onClick={() => {
              const next = selected.has(id) ? [...(design.groundStations || [])].filter((x) => x !== id) : [...(design.groundStations || []), id]
              setGroundStations(next)
            }}>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi size={18} className={checked ? 'text-emerald-400' : 'text-space-500'} />
                  <span className="font-semibold text-sm">{st.name}</span>
                </div>
                <div className="text-[10px] text-space-400 space-y-1">
                  <div>{st.location}</div>
                  <div className="flex gap-1">
                    {st.bands.map((b: string) => (
                      <span key={b} className="px-1.5 py-0.5 rounded bg-space-700 text-[10px] text-space-300">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs font-mono text-white">{st.contactMinutesPerDay} min/day contact</div>
              </div>
              <label className="flex items-center justify-between p-2 bg-space-800/50 rounded-lg">
                <span className="text-[10px] text-space-400">$${st.cost}M</span>
                <input type="checkbox" defaultChecked={checked} className="rounded space-900 border-space-600 text-emerald-500" readOnly />
              </label>
            </Card>
          )
        })}
      </div>

      <div className="card-like p-4 rounded-xl border border-space-600 bg-space-800/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Estimated downlink capacity</span>
          <span className={`font-mono text-sm ${downlink > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {downlink.toFixed(0)} min/day
          </span>
        </div>
        <div className="text-xs text-space-500">
          Each ground station provides contact minutes per day. Your antenna band (chosen in Phase 2) converts contact time into GB/day.
        </div>
        {!downlink && <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
          No ground stations selected — you cannot downlink data.
        </div>}
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setPhase('orbit')} size="sm">Back</Button>
        <Button onClick={() => setPhase('review')} disabled={downlink === 0} className="ml-auto">
          <Database size={18} className="mr-2" /> Continue to Design Review
        </Button>
      </div>
    </div>
  )
}

export default GroundPage;
