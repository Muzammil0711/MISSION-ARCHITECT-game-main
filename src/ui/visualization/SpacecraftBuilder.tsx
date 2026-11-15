import { useGameStore } from '@/store/gameStore'
import catalogs from '@/engine/catalogs'
import type { SubsystemChoice } from '@/engine/types'

const MODULE_COLORS: Record<string, string> = {
  structure: '#3b82f6',
  power: '#f59e0b',
  comms: '#10b981',
  computer: '#8b5cf6',
  attitude: '#ef4444',
  thermal: '#06b6c4',
  propulsion: '#84cc16',
}

interface SpacecraftBuilderProps {
  className?: string
}

export function SpacecraftBuilder({ className = '' }: SpacecraftBuilderProps) {
  const { design } = useGameStore()
  const instruments: Record<string, any> = catalogs.instruments

  const selectedBus = design.busSize
  const selectedSubsystems = Object.values(design.subsystems || {})
  const selectedInstruments = (design.instruments || []).map((id) => instruments[id]).filter(Boolean)

  const busWidthMap: Record<string, number> = {
    '3U': 120, '6U': 160, '12U': 210, smallsat: 260, medium: 340, large: 420,
  }
  const busWidth = (selectedBus && busWidthMap[selectedBus]) || 160

  return (
    <div className={`rounded-2xl border border-space-600 bg-space-800/40 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-space-600" />
        <span className="text-sm font-semibold text-white">Spacecraft Builder</span>
        <span className="ml-auto text-[10px] text-space-500">
          {selectedBus || 'No bus'} · {selectedSubsystems.length + selectedInstruments.length} modules
        </span>
      </div>

      <div className="flex items-end justify-center gap-2 h-48">
        <div className="relative flex items-end gap-1">
          <div className="relative z-10">
            <div className="h-16 rounded-lg border-2 border-space-600 bg-space-900/80 flex items-center justify-center shadow-inner relative" style={{ width: busWidth }}>
              <span className="text-[10px] font-mono text-space-400">{selectedBus || 'Select bus'}</span>
            </div>
          </div>

          {selectedSubsystems.map((m: SubsystemChoice) => (
            <div key={m.id} className="absolute top-[-28px] w-10 h-10 rounded-full border border-space-600 bg-space-700/80 flex items-center justify-center shadow-lg left-1/2 -translate-x-1/2" style={{ backgroundColor: MODULE_COLORS[m.id.split('-')[0]] || '#64748b' }}>
              <span className="text-[9px] font-bold text-white">{m.id.charAt(0).toUpperCase()}</span>
            </div>
          ))}
          {selectedInstruments.map((inst: any) => (
            <div key={inst.id} className="absolute top-[-44px] w-8 h-8 rounded border border-space-500 bg-space-700/70 flex items-center justify-center shadow left-1/2 -translate-x-1/2" style={{ backgroundColor: '#c084fc' }}>
              <span className="text-[8px] font-bold text-white">I</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 max-h-32 overflow-y-auto pr-2 space-y-1.5">
        {selectedSubsystems.length === 0 && selectedInstruments.length === 0 && (
          <div className="text-[11px] text-space-500 text-center py-2">Add subsystems &amp; instruments to assemble</div>
        )}
        {[...selectedSubsystems, ...selectedInstruments].map((m: any, i) => (
          <div key={m.id || i} className="flex items-center gap-2 p-1.5 rounded-lg border border-space-700/50 bg-space-900/40 text-[11px]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODULE_COLORS[m.id?.split('-')[0]] || '#c084fc' }} />
            <span className="flex-1 text-space-300">{m.name}</span>
            <span className="text-space-500">{m.mass}kg</span>
          </div>
        ))}
      </div>
    </div>
  )
}
