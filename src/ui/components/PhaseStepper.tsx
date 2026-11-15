import * as React from 'react'
import { ChevronRight, Play, AlertCircle, CheckCircle2, Rocket, FileText, Microscope, Satellite, Wifi } from 'lucide-react'

const PHASES: Array<{ id: string; label: string; icon: React.ElementType; tooltip: string }> = [
  { id: 'concept', label: '1. Concept', icon: Microscope, tooltip: 'Mission Concept: choose scenario, objective, and requirements.' },
  { id: 'spacecraft', label: '2. Spacecraft', icon: Satellite, tooltip: 'Spacecraft & Payload: bus, subsystems, instruments.' },
  { id: 'orbit', label: '3. Orbit & Launch', icon: Rocket, tooltip: 'Orbit & Launch Vehicle selection with compatibility check.' },
  { id: 'ground', label: '4. Ground Segment', icon: Wifi, tooltip: 'Ground stations and communications plan.' },
  { id: 'review', label: '5. Design Review', icon: AlertCircle, tooltip: 'Design Review: validation, warnings, and launch approval.' },
  { id: 'launch', label: '6. Launch', icon: Rocket, tooltip: 'Launch: animated liftoff sequence.' },
  { id: 'operations', label: '7. Operations', icon: Play, tooltip: 'Mission Operations simulation with random events.' },
  { id: 'report', label: '8. Report', icon: FileText, tooltip: 'Post-Mission Report: score, badges, and lessons.' },
]

interface PhaseStepperProps {
  active: string
  completed: Record<string, boolean>
  onClick?: (id: string) => void
}

export function PhaseStepper({ active, completed, onClick }: PhaseStepperProps) {
  return (
    <div className="glass rounded-2xl p-3 border border-space-600 shadow-xl w-full max-w-4xl mx-auto mb-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {PHASES.map((p) => {
          const isActive = p.id === active
          const done = completed[p.id]
          return (
            <div key={p.id} className="flex items-center gap-2 shrink-0" onClick={() => onClick?.(p.id)} role="button" tabIndex={0} className-hover="cursor-pointer">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-emerald-600 text-white border-emerald-400' :
                isActive ? 'bg-nasa-blue text-white border-blue-400' :
                'bg-space-700 text-space-400 border-space-600'
              } border`}
                title={p.tooltip}>
                {done ? <CheckCircle2 size={14} /> : <p.icon size={14} />}
              </div>
              <span className={`text-xs font-medium transition-colors ${done ? 'text-emerald-400' : isActive ? 'text-white' : 'text-space-500'}`}>
                {p.label}
              </span>
              {p.id !== 'report' && <ChevronRight size={14} className="text-space-700 shrink-0" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
