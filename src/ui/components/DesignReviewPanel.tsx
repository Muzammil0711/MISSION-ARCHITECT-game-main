import type { RuleViolation } from '@/engine/types'
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

interface DesignReviewPanelProps {
  violations: RuleViolation[]
  canLaunch: boolean
  cml: number
  onLaunch?: () => void
}

export function DesignReviewPanel({ violations, canLaunch, cml, onLaunch }: DesignReviewPanelProps) {
  const errors = violations.filter((v) => v.severity === 'error')
  const warnings = violations.filter((v) => v.severity === 'warning')
  return (
    <div className="rounded-2xl border border-space-600 bg-space-800/60 p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-nasa-blue/10 flex items-center justify-center text-nasa-blue">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Design Review — CML {cml} / 4</h3>
          <p className="text-xs text-space-400">Concept Maturity Level (JPL framework). Advance by completing phases.</p>
        </div>
      </div>

      <div className="grid gap-2">
        {errors.length > 0 && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-sm font-bold text-red-400">Launch BLOCKED — {errors.length} error(s) to fix</span>
            </div>
            <ul className="text-sm text-red-200 space-y-1 list-disc pl-4">
              {errors.map((v) => (
                <li key={v.id} className="flex gap-2">
                  <span className="text-red-500">{v.title}</span>
                  <span className="text-red-300/90">{v.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-sm font-bold text-amber-400">{warnings.length} caution(s)</span>
            </div>
            <ul className="text-sm text-amber-200 space-y-1 list-disc pl-4">
              {warnings.map((v) => (
                <li key={v.id} className="flex gap-2">
                  <span className="text-amber-500">{v.title}</span>
                  <span className="text-amber-300/90">{v.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {errors.length === 0 && warnings.length === 0 && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-sm font-bold text-emerald-400">Design review passed — ready for launch</span>
            </div>
          </div>
        )}
      </div>

      {canLaunch && onLaunch && (
        <button
          onClick={onLaunch}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
        >
          <RocketIcon size={18} /> Approve Launch
        </button>
      )}
      {!canLaunch && !errors.length && warnings.length === 0 && (
        <button className="w-full py-3 bg-space-700 text-space-400 rounded-xl font-bold cursor-not-allowed">Resolve issues to launch</button>
      )}
    </div>
  )
}

function RocketIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7l9 10 9-10z" /><path d="M12 17H3L12 2l9 15H12z" />
    </svg>
  )
}
