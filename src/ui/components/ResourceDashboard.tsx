import type { Resources } from '@/engine/types'
import { Tooltip } from './Tooltip'

export function ResourceBar({ label, used, limit, unit, status, why }: {
  label: string; used: number; limit: number; unit: string; status: 'ok'|'warning'|'exceeded'; why: string
}) {
  const pct = limit === 0 ? 0 : Math.min(100, (used / limit) * 100)
  const color = status === 'exceeded' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <Tooltip label={label} description={why}>
          <span className="text-xs font-medium text-space-300">{label}</span>
        </Tooltip>
        <span className={`text-xs font-mono ${status === 'exceeded' ? 'text-red-400' : status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
          {used.toLocaleString(undefined, { maximumFractionDigits: 1 })}/{limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full h-2 bg-space-700/50 rounded-full overflow-hidden border border-space-600">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        {pct > 0 && <div className="absolute -right-2 -top-6 hidden md:block">{/* dot handled in flex above */}</div>}
      </div>
    </div>
  )
}

export function ResourceDashboard({ resources }: { resources: Resources }) {
  return (
    <div className="glass px-4 py-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 border border-space-600 shadow-2xl">
      <div className="flex flex-wrap gap-6 md:gap-8 min-w-0">
        <ResourceBar {...resources.mass} label="Mass" />
        <ResourceBar {...resources.power} label="Power" />
        <ResourceBar {...resources.budget} label="Budget" />
        <ResourceBar {...resources.data} label="Data" />
        <ResourceBar {...resources.comms} label="Comms" />
        <ResourceBar {...resources.time} label="Time" />
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 text-xs bg-space-700 hover:bg-space-600 text-white rounded-lg border border-space-600 transition">Learn more</button>
      </div>
    </div>
  )
}
