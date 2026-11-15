import * as React from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/ui/components/Button'
import { Rocket, Play, AlertTriangle } from 'lucide-react'

export function LaunchPage() {
  const { setPhase, rules } = useGameStore()

  if (!rules.canLaunch) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center animate-in fade-in zoom-in duration-400">
        <div className="p-8 rounded-2xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold text-white mb-2">Launch not approved</h3>
          <p className="text-space-400 mb-6">Resolve the design-review errors before launch.</p>
          <Button variant="outline" onClick={() => setPhase('review')}>Back to review</Button>
        </div>
      </div>
    )
  }

  return <LaunchSequence onComplete={() => setPhase('operations')} />
}


function LaunchSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = React.useState<'idle'|'countdown'|'liftoff'|'orbit'|'done'>('idle')
  const [count, setCount] = React.useState(3)

  React.useEffect(() => {
    if (stage === 'idle') {
      const t = setTimeout(() => setStage('countdown'), 600)
      return () => clearTimeout(t)
    }
  }, [stage])

  React.useEffect(() => {
    if (stage !== 'countdown') return
    let i = count
    const t = setInterval(() => {
      if (i <= 0) { setStage('liftoff'); clearInterval(t); return }
      setCount(i - 1)
      i--
    }, 1000)
    return () => clearInterval(t)
  }, [stage, count])

  React.useEffect(() => {
    if (stage === 'liftoff') {
      const t = setTimeout(() => { setStage('orbit'); }, 1700)
      return () => clearTimeout(t)
    }
    if (stage === 'orbit') {
      const t = setTimeout(() => { setStage('done'); onComplete(); }, 1500)
      return () => clearTimeout(t)
    }
  }, [stage, onComplete])

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in duration-400">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-space-900 via-space-800 to-black rounded-full w-64 h-64 mx-auto blur-3xl opacity-40" />
        <div className={`relative w-16 h-16 rounded-full border border-space-700 bg-space-900/80 flex items-center justify-center mx-auto shadow-2xl transition-all duration-700 ${
          stage === 'liftoff' ? 'translate-y-[-200px] scale-110 filter:drop-shadow-[0_0_40px_rgba(16,185,129,0.6)]' :
          stage === 'orbit' ? 'translate-y-[-560px] scale-90' : ''
        }`}>
          <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        {stage === 'liftoff' && (
          <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-4 h-24 bg-gradient-to-t from-emerald-400 to-transparent animate-[launch_2.5s_ease-out_forwards]" />
        )}
      </div>

      <div className="mt-10">
        {stage === 'countdown' && (
          <div className="text-6xl font-mono font-bold text-white tracking-tighter">
            {count > 0 ? count : 'LIFTOFF'}
          </div>
        )}
        {stage === 'idle' && (
          <Button size="lg" onClick={() => setStage('countdown')} className="bg-nasa-blue">
            <Rocket size={22} className="mr-2" /> Initiate Launch
          </Button>
        )}
        {stage === 'liftoff' && <div className="text-emerald-400 font-bold text-lg animate-pulse">LIFTOFF — clears the tower</div>}
        {stage === 'orbit' && <div className="text-nasa-blue font-bold text-lg">Spacecraft in orbit — deployment complete</div>}
        {stage === 'done' && <Play size={32} className="text-emerald-400 animate-bounce" />}
      </div>
    </div>
  )
}

export default LaunchPage;
