import * as React from 'react'
import { useGameStore } from '@/store/gameStore'
import catalogs from '@/engine/catalogs'
import { Button, Card, CardHeader, CardTitle } from '@/ui/components/Button'
import { Target, Microscope, Rocket, AlertTriangle } from 'lucide-react'

export function ConceptPage() {
  const { design, setScenario, setObjective, setPhase, recompute } = useGameStore()
  const scenarios: Record<string, any> = catalogs.scenarios
  const scenario = scenarios[design.scenarioId]
  const objectives: any[] = scenario?.objectives || []

  React.useEffect(() => { recompute() }, [recompute])

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-in fade-in zoom-in duration-400">
      <div className="flex items-center gap-3 mb-2">
        <Microscope size={26} className="text-nasa-blue" />
        <h2 className="text-2xl font-bold text-white">Phase 1 — Mission Concept</h2>
      </div>
      <p className="text-space-400">Choose your mission scenario, science objective, and requirements. This sets your budget cap, difficulty, and which instruments are compatible.</p>

      <Card className="grid md:grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <CardHeader><CardTitle>Scenario</CardTitle></CardHeader>
          <div className="space-y-2">
            {Object.values(scenarios).map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  design.scenarioId === s.id
                    ? 'border-nasa-blue bg-nasa-blue/10 text-white'
                    : 'border-space-600 bg-space-800/30 hover:border-space-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">{s.name}</div>
                    <div className="text-xs text-space-400">{s.difficulty}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${s.difficulty === 'Beginner' ? 'bg-emerald-900 text-emerald-300' : s.difficulty === 'Engineer' ? 'bg-amber-900 text-amber-300' : 'bg-red-900 text-red-300'}`}>
                    {s.difficulty}
                  </span>
                </div>
                <p className="text-xs text-space-400 mt-2">{s.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-nasa-blue">
                  <Rocket size={12} /> Resembles: {s.nasaAnalog}
                </div>
              </button>
            ))}
          </div>
        </div>
        {scenario && (
          <div className="col-span-2 md:col-span-1">
            <CardHeader><CardTitle>Objective</CardTitle></CardHeader>
            <p className="text-sm text-space-400 mb-3">{scenario.why}</p>
            <div className="space-y-2">
              {objectives.map((o: any) => (
                <button
                  key={o.id}
                  onClick={() => setObjective(o.id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    design.objectiveId === o.id
                      ? 'border-emerald-500 bg-emerald-900/20 text-white'
                      : 'border-space-600 bg-space-800/30 hover:border-space-500'
                  }`}
                >
                  <div className="font-semibold text-white">{o.name}</div>
                  <div className="text-xs text-space-400 mt-1">{o.description}</div>
                </button>
              ))}
            </div>
            {design.objectiveId && (
              <div className="mt-4 p-3 rounded-xl bg-space-700/40 border border-space-600">
                <div className="flex items-center gap-2 mb-1"><Target size={14} className="text-emerald-400" /><span className="text-xs font-bold text-emerald-300">Required min. science return</span></div>
                <div className="text-xs text-white">{scenario.minScienceReturn}/100 science · Budget cap: ${scenario.budgetCap}M · {scenario.durationMonths} months lifetime</div>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setPhase('spacecraft')} disabled={!design.objectiveId}>
          <Rocket size={18} className="mr-2" /> Continue to Spacecraft Design
        </Button>
      </div>
      {!design.objectiveId && (
        <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
          <AlertTriangle size={16} className="mr-2 mt-0.5" /> Select a science objective before continuing.
        </div>
      )}
    </div>
  )
}

export default ConceptPage;
