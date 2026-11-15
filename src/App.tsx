import * as React from 'react'
import { PhaseStepper } from '@/ui/components/PhaseStepper'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/ui/components/Button'
import { ArrowLeft, Star, Users } from 'lucide-react'
import ConceptPage from '@/pages/ConceptPage'
import SpacecraftPage from '@/pages/SpacecraftPage'
import OrbitPage from '@/pages/OrbitPage'
import GroundPage from '@/pages/GroundPage'
import ReviewPage from '@/pages/ReviewPage'
import LaunchPage from '@/pages/LaunchPage'
import OperationsPage from '@/pages/OperationsPage'
import ReportPage from '@/pages/ReportPage'
import DataSourcesPage from '@/pages/DataSourcesPage'
import MultiplayerPage from '@/multiplayer/MultiplayerPage'

export default function App() {
  return (
    <div className="min-h-screen bg-space-900 text-white">
      <GameLayout />
    </div>
  )
}

function GameLayout() {
  const { phase, rules } = useGameStore()
  const completed = rules.phaseCompletion || {}

  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 px-4 pt-6 pb-20 relative overflow-x-hidden">
        <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none" aria-hidden="true">
          <Starfield />
        </div>
        <PhaseStepper active={phase} completed={completed} />
        <RouteView phase={phase} />
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  const { setPhase, setDifficulty, difficulty, isJudgeDemo, setJudgeDemo } = useGameStore()
  return (
    <header className="glass border-b border-space-600 px-6 py-3 flex items-center justify-between shadow-lg sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={() => setPhase('landing')} className="p-2 text-space-400 hover:text-white transition" title="Back to landing">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-nasa-blue to-emerald-500 flex items-center justify-center text-xs font-bold shadow-lg">MA</div>
          <span className="font-bold text-xl tracking-tighter text-white">MISSION<span className="text-nasa-blue">ARCHITECT</span></span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} label="Mode" />
        <Button variant="ghost" size="sm" onClick={() => setJudgeDemo(!isJudgeDemo)} title={isJudgeDemo ? 'Exit Judge Demo' : 'Judge Demo / Quick Demo'}>
          {isJudgeDemo ? 'Demo: ON' : <span className="flex items-center gap-1"><Star size={14} /> Judge Demo</span>}
        </Button>
      </div>
    </header>
  )
}

function Select({ value, onChange, label }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-space-400">{label}</span>
      <select className="bg-space-800 border border-space-600 text-xs text-white rounded px-2 py-1 outline-none focus:border-nasa-blue" value={value} onChange={onChange}>
        <option value="Beginner">Beginner</option>
        <option value="Engineer">Engineer</option>
        <option value="MissionDirector">Mission Director</option>
      </select>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-space-700 bg-space-900/80 backdrop-blur px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-space-400">
      <div className="flex items-center gap-4">
        <span>NASA-inspired · Space Apps Challenge</span>
        <span>·</span>
        <span>Keyboard: 1-8 phases · ? help</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Single-player &amp; team mode (up to 4)</span>
      </div>
    </footer>
  )
}

function RouteView({ phase }: { phase: string }) {
  switch (phase) {
    case 'landing': return <LandingPage />
    case 'concept': return <ConceptPage />
    case 'spacecraft': return <SpacecraftPage />
    case 'orbit': return <OrbitPage />
    case 'ground': return <GroundPage />
    case 'review': return <ReviewPage />
    case 'launch': return <LaunchPage />
    case 'operations': return <OperationsPage />
    case 'report': return <ReportPage />
    case 'datasources': return <DataSourcesPage />
    case 'multiplayer': return <MultiplayerPage />
    default: return <LandingPage />
  }
}

function Starfield() {
  const [stars] = React.useState(() => Array.from({ length: 120 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, d: Math.random() * 3 + 1, delay: Math.random() * 5
  })))
  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <div key={i} className="absolute bg-white rounded-full" style={{
          left: `${s.x}%`, top: `${s.y}%`, width: `${s.d}px`, height: `${s.d}px`,
          opacity: 0.6, animation: `twinkle ${3 + s.d}s ease-in-out infinite ${s.delay}s`,
        }} />
      ))}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes twinkle { 0%,100%{opacity:.4} 50%{opacity:1} }` }} />
    </div>
  )
}

function LandingPage() {
  const { setScenario, setPhase, setJudgeDemo, newMission } = useGameStore()

  const startDemo = () => {
    setJudgeDemo(true)
    setScenario('earth')
    setPhase('concept')
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 leading-tight">
          MISSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-nasa-blue to-emerald-400">ARCHITECT</span>
        </h1>
        <p className="text-space-300 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
          Design, launch, and operate a real space mission. Trade mass, power, budget, data, and orbit — every decision has visible consequences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button size="lg" onClick={() => { newMission(); setPhase('concept') }} className="w-full sm:w-auto">
            Start New Mission
          </Button>
          <Button variant="outline" size="lg" onClick={() => setPhase('multiplayer')} className="w-full sm:w-auto">
            <Users size={18} className="mr-2" /> Team Mode
          </Button>
          <Button variant="danger" size="lg" onClick={startDemo} className="w-full sm:w-auto">
            <Star size={20} className="mr-2" /> JUDGE MODE / QUICK DEMO
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-space-500">
          <div className="flex items-center gap-2"><Star size={14} className="text-amber-500" /> 8 phases</div>
          <div className="flex items-center gap-2"><Star size={14} className="text-amber-500" /> 5 scenarios</div>
          <div className="flex items-center gap-2"><Star size={14} className="text-amber-500" /> Team mode</div>
          <div className="flex items-center gap-2"><Star size={14} className="text-amber-500" /> No login</div>
        </div>
      </div>
    </div>
  )
}
