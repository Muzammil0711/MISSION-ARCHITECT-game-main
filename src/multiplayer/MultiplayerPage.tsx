import * as React from 'react'
import { useMultiplayerStore } from '@/multiplayer/store'
import { RoomManager, NegotiationPanel } from '@/multiplayer/components'
import { initSync } from '@/multiplayer/sync'
import { useGameStore } from '@/store/gameStore'
import { Card } from '@/ui/components/Button'
import { ArrowLeft, Users } from 'lucide-react'
import type { PlayerRole } from '@/multiplayer/types'
import ConceptPage from '@/pages/ConceptPage'
import SpacecraftPage from '@/pages/SpacecraftPage'
import OrbitPage from '@/pages/OrbitPage'
import GroundPage from '@/pages/GroundPage'
import ReviewPage from '@/pages/ReviewPage'

export function MultiplayerPage() {
  const {
    myRole, phase: mpPhase, setPhase: setMPPhase,
  } = useMultiplayerStore()
  const { phase: gamePhase, setPhase: setGamePhase } = useGameStore()

  // Initialize sync
  React.useEffect(() => { initSync() }, [])

  // Lobby -> room manager
  if (mpPhase === 'lobby') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <RoomManager onEnter={() => {}} />
      </div>
    )
  }

  // Map multiplayer phase -> single-player game phase for shared content
  const phaseMap: Record<string, string> = {
    designing: gamePhase, // stay on current game phase during design
    negotiating: 'review',
    review: 'review',
    launching: 'launch',
    operations: 'operations',
    reporting: 'report',
    ended: 'report',
  }
  const gamePhaseForMP = phaseMap[mpPhase] || gamePhase

  return (
    <div className="flex flex-col h-full">
      <MPHeader />
      <main className="flex-1 px-4 pt-6 pb-20 relative overflow-x-hidden">
        <MPStepper active={mpPhase} setPhase={setMPPhase} myRole={myRole} />
        <MPBody
          mpPhase={mpPhase}
          gamePhase={gamePhaseForMP}
          myRole={myRole}
          setGamePhase={setGamePhase}
        />
      </main>
      <MPFooter />
    </div>
  )
}

function MPHeader() {
  const { roomCode, myRole, connected, backend, nickname, setNickname } = useMultiplayerStore()
  return (
    <header className="glass border-b border-space-600 px-6 py-3 flex items-center justify-between shadow-lg sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <ArrowLeft size={20} className="text-space-400 hover:text-white cursor-pointer" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-nasa-blue to-emerald-500 flex items-center justify-center text-[10px] font-bold shadow-lg">T</div>
          <span className="font-bold text-xl tracking-tighter text-white">MISSION<span className="text-nasa-blue">ARCHITECT</span></span>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold border border-space-600 text-space-400">TEAM</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex flex-col items-end text-right">
          <div className="text-[10px] font-mono text-space-400">Room {roomCode}</div>
          <div className="text-xs font-semibold text-white">{myRole ? ROLE_SHORT[myRole] : 'Lobby'}</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input text-[10px] w-24"
            placeholder="Name"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <span className={`tooltip-dot ${connected ? 'tooltip-dot-ok' : 'tooltip-dot-err'}`}></span>
          <span className="text-[10px] text-space-400">{connected ? 'Synced' : 'Hot-seat'}</span>
          <span className="text-[10px] font-mono text-space-500">{backend}</span>
        </div>
      </div>
    </header>
  )
}

const ROLE_SHORT: Record<PlayerRole, string> = {
  'mission-director': 'Director',
  'spacecraft-engineer': 'Engineer',
  'science-lead': 'Science',
  'comms-launch-lead': 'Comms',
}

function MPStepper({ active, setPhase, myRole }: { active: string; setPhase: any; myRole: PlayerRole | null }) {
  const PHASES: Array<{ id: string; label: string }> = [
    { id: 'lobby', label: 'Lobby' },
    { id: 'designing', label: 'Design' },
    { id: 'negotiating', label: 'Negotiate' },
    { id: 'review', label: 'Review' },
    { id: 'launching', label: 'Launch' },
    { id: 'operations', label: 'Operations' },
    { id: 'reporting', label: 'Report' },
  ]

  return (
    <div className="glass rounded-2xl p-3 border border-space-600 shadow-xl w-full max-w-4xl mx-auto mb-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {PHASES.map((p) => {
          const isActive = p.id === active
          return (
            <div key={p.id} className="flex items-center gap-2 shrink-0" onClick={() => myRole && setPhase(p.id as any)} role="button" tabIndex={0}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                isActive ? 'bg-nasa-blue text-white border-blue-400' : 'bg-space-700 text-space-500 border-space-600'
              } border`}>
                {p.id.charAt(0).toUpperCase()}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-space-500'}`}>{p.label}</span>
              {p.id !== 'reporting' && <span className="text-[10px] text-space-700 shrink-0">›</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MPBody({ mpPhase, gamePhase, myRole, setGamePhase }: {
  mpPhase: string; gamePhase: any; myRole: PlayerRole | null; setGamePhase: any
}) {
  const { activeNegotiation } = useMultiplayerStore()

  // Negotiation overlay takes over when in negotiating phase
  if (mpPhase === 'negotiating' && activeNegotiation) {
    return <NegotiationPanel onClose={() => {}} />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in zoom-in duration-400">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Team Design — {mpPhase.charAt(0).toUpperCase() + mpPhase.slice(1)}</h2>
          <p className="text-xs text-space-500">Shared mission state — all roles see the same design.</p>
        </div>
        {myRole && (
          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${MP_ROLE_ACCENT[myRole]}`}>
            {MP_ROLE_LABEL[myRole]}
          </span>
        )}
      </div>

      {/* Role station panel */}
      <RoleStation role={myRole} />

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          {/* Shared mission content */}
          <MPGameView gamePhase={gamePhase} setGamePhase={setGamePhase} />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <MPResourceDash />
          <MPReviewMini />
        </div>
      </div>
    </div>
  )
}

const MP_ROLE_LABEL: Record<PlayerRole, string> = {
  'mission-director': 'Director',
  'spacecraft-engineer': 'Engineer',
  'science-lead': 'Science',
  'comms-launch-lead': 'Comms',
}
const MP_ROLE_ACCENT: Record<PlayerRole, string> = {
  'mission-director': 'border-nasa-blue/50 bg-nasa-blue/10 text-nasa-blue-glow',
  'spacecraft-engineer': 'border-emerald-900/50 bg-emerald-900/10 text-emerald-400',
  'science-lead': 'border-amber-900/50 bg-amber-900/10 text-amber-400',
  'comms-launch-lead': 'border-purple-900/50 bg-purple-900/10 text-purple-400',
}

function RoleStation({ role }: { role: PlayerRole | null }) {
  if (!role) return (
    <Card className="p-4 text-center text-space-500">
      <Users size={32} className="mx-auto mb-2 text-space-700" />
      <p className="text-sm">Select your role in the lobby.</p>
    </Card>
  )
  return (
    <Card className={`p-4 ${MP_ROLE_ACCENT[role]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-white uppercase">{MP_ROLE_LABEL[role]}</span>
        <span className="text-[10px] text-space-400">Station</span>
      </div>
      <div className="text-xs text-space-400">{MP_ROLE_HINT[role]}</div>
    </Card>
  )
}

const MP_ROLE_HINT: Record<PlayerRole, string> = {
  'mission-director': 'Approve budget, schedule, and final launch. Controls phase transitions.',
  'spacecraft-engineer': 'Bus, subsystems, mass & power margins.',
  'science-lead': 'Objectives and instruments. Maximize science return.',
  'comms-launch-lead': 'Orbit, launch vehicle, ground stations. Downlink budget.',
}

function MPGameView({ gamePhase }: { gamePhase: any; setGamePhase?: any }) {
  // Render the single-player page matching the current game phase.
  // Buttons inside still work and advance the shared game state.
  switch (gamePhase) {
    case 'concept': return <ConceptPage />
    case 'spacecraft': return <SpacecraftPage />
    case 'orbit': return <OrbitPage />
    case 'ground': return <GroundPage />
    case 'review': return <ReviewPage />
    case 'launch': return <div className="p-6 text-center text-space-500">Launch sequence (team)</div>
    case 'operations': return <div className="p-6 text-center text-space-500">Operations sim (team)</div>
    case 'report': return <div className="p-6 text-center text-space-500">Post-mission report (team)</div>
    default: return <div className="p-6 text-center text-space-500">Select a design phase to begin.</div>
  }
}

function MPResourceDash() {
  const { resources } = useGameStore()
  const keys = ['mass', 'power', 'budget', 'data', 'comms', 'time'] as const
  const entries: Array<{ key: string; r: any; pct: number; color: string }> = []
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const r = resources[k]
    const pct = r.limit === 0 ? 0 : Math.min(100, (r.used / r.limit) * 100)
    const color = r.status === 'exceeded' ? 'bg-red-500' : r.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
    entries.push({ key: k, r, pct, color })
  }
  return (
    <Card className="p-4">
      <div className="text-xs font-bold text-space-400 uppercase mb-3">Resources (shared)</div>
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.key} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-space-500">{e.key.toUpperCase()}</span>
              <span className={`font-mono ${e.r.status === 'exceeded' ? 'text-red-400' : e.r.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{e.r.used.toFixed(0)}/{e.r.limit.toFixed(0)}</span>
            </div>
            <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
              <div className={`h-full ${e.color}`} style={{ width: `${e.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function MPReviewMini() {
  const { rules } = useGameStore()
  const errors = rules.violations.filter((v: any) => v.severity === 'error').length
  const warnings = rules.violations.filter((v: any) => v.severity === 'warning').length
  return (
    <Card className="p-4">
      <div className="text-xs font-bold text-space-400 uppercase mb-2">Design Review</div>
      <div className="text-[10px] text-space-500 mb-2">CML {rules.cml} / 4</div>
      <div className="w-full bg-space-700 h-1.5 rounded-full overflow-hidden mb-3">
        <div className={`h-full ${rules.cml >= 4 ? 'bg-emerald-500' : rules.cml === 3 ? 'bg-amber-500' : 'bg-nasa-blue'}`} style={{ width: `${rules.cml * 25}%` }} />
      </div>
      <div className={`p-2 rounded text-[10px] font-bold ${
        errors > 0 ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
        warnings > 0 ? 'bg-amber-900/20 text-amber-400 border border-amber-500/30' :
        'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30'
      }`}>
        {errors > 0 ? `${errors} error(s)` : warnings > 0 ? `${warnings} caution(s)` : 'Review clean'}
      </div>
    </Card>
  )
}

function MPFooter() {
  return (
    <footer className="border-t border-space-700 bg-space-900/80 backdrop-blur px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-space-400">
      <div className="flex items-center gap-4">
        <span>Hot-seat / same-screen · Zero backend required</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Up to 4 players · Roles synced in real time</span>
      </div>
    </footer>
  )
}

export default MultiplayerPage
