import { useGameStore } from '@/store/gameStore'
import { DesignReviewPanel } from '@/ui/components/DesignReviewPanel'
import { ResourceDashboard } from '@/ui/components/ResourceDashboard'
import { Card, CardHeader, CardTitle } from '@/ui/components/Button'
import { AlertCircle, CheckCircle2, List } from 'lucide-react'

export function ReviewPage() {
  const { rules, design, resources, setPhase } = useGameStore()
  const violations = rules.violations || []
  const errors = violations.filter((v) => v.severity === 'error')

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in zoom-in duration-400">
      <div className="flex items-center gap-3 mb-2">
        <List size={26} className="text-nasa-blue" />
        <h2 className="text-2xl font-bold text-white">Phase 5 — Design Review</h2>
      </div>
      <p className="text-space-400">Validation before launch. Every rule is shown in plain English. Fix errors to approve launch.</p>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: review panel */}
        <div className="lg:col-span-2 space-y-4">
          <DesignReviewPanel
            violations={violations}
            canLaunch={rules.canLaunch}
            cml={rules.cml}
            onLaunch={() => setPhase('launch')}
          />
          <Card>
            <CardHeader><CardTitle>Violations detail</CardTitle></CardHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {violations.length === 0 && <p className="text-sm text-emerald-400">No issues. Clean design.</p>}
              {violations.map((v) => (
                <div key={v.id} className={`p-3 rounded-lg border ltr:${
                  v.severity === 'error' ? 'border-red-500/30 bg-red-500/5' :
                  v.severity === 'warning' ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {v.severity === 'error' ? <AlertCircle size={14} className="text-red-400" /> :
                     v.severity === 'warning' ? <AlertCircle size={14} className="text-amber-400" /> : <CheckCircle2 size={14} className="text-emerald-400" />}
                    <span className={`font-bold text-sm ${v.severity === 'error' ? 'text-red-400' : v.severity === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {v.severity.toUpperCase()} — {v.title}
                    </span>
                  </div>
                  <p className="text-sm text-space-300">{v.message}</p>
                  <p className="text-[11px] text-space-500 mt-1">Fix: {v.fix}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: resources + CML */}
        <div className="space-y-4">
          <ResourceDashboard resources={resources} />
          <Card>
            <CardHeader><CardTitle>Concept Maturity Level</CardTitle></CardHeader>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-space-400 mb-1">
                <span>CML {rules.cml} / 4</span>
                <span className="font-mono text-white">{rules.phaseCompletion.concept ? '1✓' : '1'} · {rules.phaseCompletion.spacecraft ? '2✓' : '2'} · {rules.phaseCompletion.orbit ? '3✓' : '3'} · {rules.phaseCompletion.ground ? '4✓' : '4'}</span>
              </div>
              <div className="w-full bg-space-700 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${rules.cml >= 4 ? 'bg-emerald-500' : rules.cml === 3 ? 'bg-amber-500' : 'bg-nasa-blue'}`} style={{ width: `${rules.cml * 25}%` }} />
              </div>
              <p className="text-[11px] text-space-500">JPL Concept Maturity Level: advances as you complete phases.</p>
            </div>
          </Card>
          <div className="p-4 rounded-xl border border-space-600 bg-space-800/40">
            <p className="text-sm text-white mb-2">Your design:</p>
            <ul className="text-xs text-space-300 space-y-1 list-disc pl-4">
              <li>Scenario: {design.scenarioId}</li>
              <li>Objective: {design.objectiveId || '—'}</li>
              <li>Bus: {design.busSize || '—'}</li>
              <li>Orbit: {design.orbitId || '—'}</li>
              <li>Launcher: {design.launchVehicleId || '—'}</li>
              <li>Ground stations: {(design.groundStations || []).length}</li>
            </ul>
          </div>
        </div>
      </div>

      {!rules.canLaunch && errors.length > 0 && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-200">
          <AlertCircle size={16} className="mr-2 mt-0.5" /> Resolve all errors above before you can launch.
        </div>
      )}
    </div>
  )
}

export default ReviewPage;
