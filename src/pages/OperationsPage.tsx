import { useGameStore } from '@/store/gameStore'
import { Button, Card, CardHeader, CardTitle } from '@/ui/components/Button'
import { Play, Pause, Bolt, Database, Activity, AlertTriangle, Moon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts'

export function OperationsPage() {
  const { simResult, simRunning, simSpeed, setSimSpeed, runSim, setPhase, design } = useGameStore()

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in zoom-in duration-400">
      <div className="flex items-center gap-3 mb-2">
        <Activity size={26} className="text-nasa-blue" />
        <h2 className="text-2xl font-bold text-white">Phase 7 — Mission Operations</h2>
      </div>
      <p className="text-space-400">Run the mission day by day. Watch power, battery, onboard data, downlink, and science. Random events can strike.</p>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button onClick={() => runSim(30)} disabled={simRunning}>
            {simRunning ? <Pause size={18} /> : <Play size={18} />} {simRunning ? 'Pause' : 'Run 30-day simulation'}
          </Button>
          <div className="flex gap-1">
            {([1, 10, 100] as const).map((s) => (
              <Button key={s} size="sm" variant={simSpeed === s ? 'primary' : 'outline'} onClick={() => setSimSpeed(s)}>
                {s}×
              </Button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
            <input type="checkbox" defaultChecked={design.eventsEnabled} onChange={() => { /* toggle via store not directly exposed; keep simple */ }} />
            <span className="text-xs text-space-400">Random events</span>
          </label>
        </div>
        <div className="flex gap-4 text-xs text-space-400">
          <div className="flex items-center gap-1"><Bolt size={12} className="text-yellow-400" /><span>Power</span></div>
          <div className="flex items-center gap-1"><Moon size={12} className="text-space-400" /><span>Battery</span></div>
          <div className="flex items-center gap-1"><Database size={12} className="text-emerald-400" /><span>Data</span></div>
          <div className="flex items-center gap-1"><Activity size={12} className="text-nasa-blue" /><span>Science</span></div>
        </div>
      </Card>

      {/* Results */}
      {!simResult ? (
        <div className="h-[300px] flex items-center justify-center rounded-2xl border border-dashed border-space-700 bg-space-800/30 text-space-500">
          Run a simulation to see results.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          <SimChart title="Power & Battery" data={simResult.states} keys={['powerGenerated','powerConsumed','batterySOC']} />
          <SimChart title="Data & Science" data={simResult.states} keys={['dataOnboard','dataDownlinked','scienceCollected']} />
        </div>
      )}

      {simResult && (
        <div className="grid md:grid-cols-4 gap-3">
          <Stat label="Days" value={simResult.summary.days} />
          <Stat label="Downlinked (GB)" value={simResult.summary.totalDownlinkedGB.toFixed(1)} />
          <Stat label="Final Science" value={simResult.summary.finalScience.toFixed(0)} />
          <Stat label="Safe-mode days" value={simResult.summary.safeModeDays} />
        </div>
      )}

      {simResult && simResult.summary.failures.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-amber-400" /><span className="font-bold text-amber-400">Events / anomalies</span></div>
          <ul className="text-sm text-amber-200 space-y-1 list-disc pl-4">
            {simResult.summary.failures.map((f: string, i: number) => <li key={i}>{f}</li>)}
          </ul>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setPhase('report')}>View Report</Button>
      </div>
    </div>
  )
}


function SimChart({ title, data, keys }: { title: string; data: any[]; keys: string[] }) {
  const colors = ['#22d3ee', '#f43f5e', '#10b981']
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="space-700" vertical={false} />
            <XAxis dataKey="day" type="number" tickCount={6} textAnchor="end" stroke="space-500" fontSize={10} />
            <YAxis stroke="space-500" fontSize={10} />
            <ReTooltip />
            <Legend verticalAlign="top" align="right" height={36} iconSize={10} />
            {keys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={colors[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}


function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-xl border border-space-600 bg-space-800/40">
      <div className="text-[10px] text-space-400 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-mono font-bold text-white">{value}</div>
    </div>
  )
}

export default OperationsPage;
