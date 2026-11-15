import * as React from 'react'
import { useMultiplayerStore } from '@/multiplayer/store'
import { useGameStore } from '@/store/gameStore'
import catalogs from '@/engine/catalogs'
import { ROLE_LABELS } from '@/multiplayer/types'
import { syncPhase } from '@/multiplayer/sync'
import { Button } from '@/ui/components/Button'
import { Card, CardHeader, CardTitle } from '@/ui/components/Button'
import { Plus, Lock, Wifi, Users, Rocket, Satellite } from 'lucide-react'

// ---------------------------------------------------------------------------
// RoomManager — create or join a room
// ---------------------------------------------------------------------------

export function RoomManager({ onEnter: _onEnter }: { onEnter?: () => void }) {
  const {
    roomCode, players, myId, myRole, phase, connected, backend, nickname,
    setNickname, joinRoom, claimRole, setPhase,
  } = useMultiplayerStore()

  const [code, setCode] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  // If a player has no role in a room they host/joined, show role picker
  const showRolePicker = phase === 'lobby' && !!myId && !myRole

  return (
    <Card className="panel-elevated max-w-2xl mx-auto">
      <CardHeader className="flex flex-col gap-2">
        <div className="section-head">
          <Users size={20} className="text-nasa-blue-glow" />
          <CardTitle className="text-lg">Multiplayer — Team Mode (up to 4)</CardTitle>
        </div>
        <div className="flex items-center gap-3 text-xs text-space-400">
          <span>Backend: <span className={`font-mono ${backend === 'websocket' ? 'text-emerald-400' : 'text-space-500'}`}>{backend}</span></span>
          <span className="tooltip-dot tooltip-dot-{connected ? 'ok' : 'err'}"></span>
          <span>{connected ? 'Connected' : 'Offline / Hot-seat'}</span>
        </div>
      </CardHeader>

      {!roomCode && !creating ? (
        <div className="card-body p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-space-700 bg-space-900/50">
              <div className="flex items-center gap-2 mb-3">
                <Plus size={20} className="text-emerald-400" />
                <span className="font-semibold text-white">Create room</span>
              </div>
              <p className="text-xs text-space-500 mb-3">Host a mission design session. Get a 6-letter room code to share with your team.</p>
              <div className="flex items-center gap-2">
                <input
                  className="input"
                  placeholder="Your name"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <Button variant="primary" onClick={() => setCreating(true)} disabled={!nickname.trim()}>
                  Create
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-space-700 bg-space-900/50">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={20} className="text-amber-400" />
                <span className="font-semibold text-white">Join room</span>
              </div>
              <p className="text-xs text-space-500 mb-3">Enter a 6-letter room code shared by the host.</p>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-uppercase"
                  placeholder="ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <Button variant="outline" onClick={() => joinRoom(code)} disabled={code.length !== 6 || !nickname.trim()}>
                  Join
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-space-700/50 bg-space-900/40 text-xs text-space-400 text-center">
            <Wifi size={14} className="mr-1.5" />
            No backend configured? You're in <strong>hot-seat / same-screen mode</strong> — fully playable solo or co-op on one device. Add <code className="font-mono text-nasa-blue-glow">VITE_MP_WS_URL</code> for real-time multiplayer.
          </div>
        </div>
      ) : (
        <div className="card-body p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Room <span className="font-mono text-nasa-blue-glow">{roomCode}</span></div>
              <div className="text-xs text-space-500">Host: {players.find((p) => p.isHost)?.name}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              // leave & reset
              const { leaveRoom } = useMultiplayerStore.getState()
              leaveRoom()
            }}>Leave</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {players.map((p) => (
              <div key={p.id} className="p-3 rounded-lg border flex items-center gap-3 bg-space-900/40">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{
                  backgroundColor: p.isHost ? '#0b3d91' : '#334155',
                  color: '#fff',
                }}>{p.name.charAt(0)}</div>
                <div>
                  <div className="text-sm font-medium text-white">{p.name}</div>
                  <div className="text-[10px] text-space-500">{p.role ? ROLE_LABELS[p.role].label : 'No role'} {p.isHost ? '(host)' : ''}</div>
                </div>
              </div>
            ))}
          </div>

          {showRolePicker && (
            <div className="p-4 rounded-xl border border-space-700 bg-space-900/60">
              <div className="text-xs font-semibold text-space-400 uppercase mb-3">Choose your role</div>
              <div className="grid md:grid-cols-4 gap-2">
                {Object.entries(ROLE_LABELS).map(([key, info]) => {
                  const role = key as any
                  const taken = players.some((p) => p.role === role && p.id !== myId)
                  const mine = myRole === role
                  return (
                    <Button
                      key={role}
                      variant={mine ? 'primary' : taken ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => claimRole(role)}
                      disabled={taken && !mine}
                      className={mine ? 'chip-active' : ''}
                    >
                      {info.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {myRole && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-space-400">Your role:</span>
                <span className={`font-semibold text-sm ${ROLE_LABELS[myRole as keyof typeof ROLE_LABELS].color}`}>
                  {ROLE_LABELS[myRole as keyof typeof ROLE_LABELS].label}
                </span>
              </div>
              <Button variant="primary" size="sm" onClick={() => setPhase('designing')}>
                <Rocket size={16} className="mr-1.5" /> Enter Design Phase
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// RolePanels — each role gets its own panel with permission-scoped controls
// ---------------------------------------------------------------------------

export function RolePanels() {
  const { myRole, phase, setPhase } = useMultiplayerStore()
  const { design, setSubsystem, setInstrument, setGroundStations, rules } = useGameStore()
  const subsystems: Record<string, any> = catalogs.subsystems
  const instruments: Record<string, any> = catalogs.instruments
  const groundStations: Record<string, any> = catalogs.groundStations

  const role = myRole
  if (!role) return null

  const isMD = role === 'mission-director'
  const isSE = role === 'spacecraft-engineer'
  const isSL = role === 'science-lead'
  const isCL = role === 'comms-launch-lead'

  return (
    <Card className={`panel-elevated ${ROLE_LABELS[role].accent}`}>
      <CardHeader className="flex items-center justify-between gap-2">
        <div className="section-head">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: role === 'mission-director' ? '#0b3d91' : role === 'spacecraft-engineer' ? '#10b981' : role === 'science-lead' ? '#f59e0b' : '#c084fc' }}>
            <span className="text-[10px] font-bold text-white">{role.charAt(0).toUpperCase()}</span>
          </div>
          <CardTitle className="text-sm">{ROLE_LABELS[role].label}</CardTitle>
        </div>
        <div className="text-[10px] font-mono text-space-500">Phase: {phase}</div>
      </CardHeader>

      <div className="card-body p-4 space-y-4">
        {/* Mission Director: budget, schedule, phase control, launch approval */}
        {isMD && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-space-700 bg-space-800/40">
              <div className="text-xs font-bold text-white mb-1">Budget & Schedule</div>
              <div className="flex gap-4 text-sm">
                <div>
                  <div className="text-space-500 text-[10px]">Budget used</div>
                  <div className="font-mono-data text-white">{rules.resources.budget.used.toFixed(1)} / {rules.resources.budget.limit} $M</div>
                </div>
                <div>
                  <div className="text-space-500 text-[10px]">Dev time</div>
                  <div className="font-mono-data text-white">{rules.resources.time.used} / {rules.resources.time.limit} months</div>
                </div>
              </div>
              <div className={`mt-2 px-2 py-1 rounded text-[10px] font-bold ${
                rules.resources.budget.status === 'exceeded' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                rules.resources.budget.status === 'warning' ? 'bg-amber-900/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {rules.resources.budget.status === 'exceeded' ? 'BUDGET OVERRUN' : rules.resources.budget.status === 'warning' ? 'Margin thin' : 'On budget'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPhase('review')}>
                <Satellite size={16} className="mr-1.5" /> Open Design Review
              </Button>
              <Button variant="primary" size="sm" disabled={!rules.canLaunch} onClick={() => syncPhase('launching', 'me')}>
                <Rocket size={16} className="mr-1.5" /> Approve Launch
              </Button>
            </div>
          </div>
        )}

        {/* Spacecraft Engineer: bus, subsystems, power */}
        {isSE && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-space-700 bg-space-800/40">
              <div className="text-xs font-bold text-white mb-1">Mass & Power</div>
              <div className="flex gap-4 text-sm">
                <div>
                  <div className="text-space-500 text-[10px]">Mass</div>
                  <div className="font-mono-data text-white">{rules.resources.mass.used.toFixed(0)} kg</div>
                </div>
                <div>
                  <div className="text-space-500 text-[10px]">Power</div>
                  <div className="font-mono-data text-white">{rules.resources.power.used.toFixed(0)} / {rules.resources.power.limit.toFixed(0)} W</div>
                </div>
              </div>
              <div className={`mt-2 px-2 py-1 rounded text-[10px] font-bold ${
                rules.resources.mass.status === 'exceeded' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                rules.resources.power.status === 'exceeded' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                rules.resources.mass.status === 'warning' || rules.resources.power.status === 'warning' ? 'bg-amber-900/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {rules.resources.mass.status === 'exceeded' || rules.resources.power.status === 'exceeded' ? 'OVER LIMIT' : rules.resources.mass.status === 'warning' || rules.resources.power.status === 'warning' ? 'Margin thin' : 'Nominal'}
              </div>
            </div>
            <div className="text-[10px] font-bold text-space-400 uppercase mb-1">Subsystems</div>
            <div className="grid md:grid-cols-2 gap-2">
              {Object.entries(subsystems).map(([cat, sys]: any) => (
                <div key={cat} className="p-2 rounded border border-space-700/50 bg-space-900/30">
                  <div className="text-[10px] font-bold text-space-500 mb-1">{sys.name}</div>
                  {Object.values(sys.choices).map((c: any) => {
                    const sel = design.subsystems[cat]?.id === c.id
                    return (
                      <Button key={c.id} variant={sel ? 'primary' : 'outline'} size="xs" onClick={() => setSubsystem(cat, sel ? null : c.id)} disabled={!sel && rules.resources.mass.status === 'exceeded'}>
                        {c.name.split(' (')[0]}
                      </Button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Science Lead: objectives & instruments */}
        {isSL && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-space-700 bg-space-800/40">
              <div className="text-xs font-bold text-white mb-1">Science</div>
              <div className="flex gap-4 text-sm">
                <div>
                  <div className="text-space-500 text-[10px]">Objective</div>
                  <div className="font-mono-data text-white">{design.objectiveId || '—'}</div>
                </div>
                <div>
                  <div className="text-space-500 text-[10px]">Instruments</div>
                  <div className="font-mono-data text-white">{design.instruments.length}</div>
                </div>
              </div>
            </div>
            <div className="text-[10px] font-bold text-space-400 uppercase mb-1">Instruments</div>
            <div className="grid md:grid-cols-3 gap-2">
              {Object.values(instruments).map((inst: any) => {
                const sel = design.instruments.includes(inst.id)
                const objOk = !design.objectiveId || inst.compatibleObjectives.includes(design.objectiveId)
                return (
                  <Button key={inst.id} variant={sel ? 'primary' : objOk ? 'outline' : 'ghost'} size="xs" onClick={() => setInstrument(inst.id, !sel)} disabled={!objOk || (sel && rules.resources.mass.status === 'exceeded')}>
                    {inst.name.split(' ')[0]}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Comms & Launch Lead: orbit, launcher, ground stations */}
        {isCL && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-space-700 bg-space-800/40">
              <div className="text-xs font-bold text-white mb-1">Orbit & Comms</div>
              <div className="flex gap-4 text-sm">
                <div>
                  <div className="text-space-500 text-[10px]">Orbit</div>
                  <div className="font-mono-data text-white">{design.orbitId || '—'}</div>
                </div>
                <div>
                  <div className="text-space-500 text-[10px]">Data rate</div>
                  <div className="font-mono-data text-white">{rules.resources.data.used.toFixed(1)} GB/day</div>
                </div>
              </div>
            </div>
            <div className="text-[10px] font-bold text-space-400 uppercase mb-1">Ground stations</div>
            <div className="grid md:grid-cols-3 gap-2">
              {Object.entries(groundStations).map(([id, st]: any) => {
                const sel = design.groundStations.includes(id)
                return (
                  <Button key={id} variant={sel ? 'primary' : 'outline'} size="xs" onClick={() => setGroundStations(sel ? design.groundStations.filter((x: string) => x !== id) : [...design.groundStations, id])}>
                    {st.name.split(' ')[0]}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Read-only hint for roles not assigned */}
        {!role && (
          <div className="p-4 rounded-lg border border-dashed border-space-700 bg-space-900/30 text-center text-xs text-space-500">
            Select a role above to control your panel.
          </div>
        )}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Negotiation — conflict resolution voting
// ---------------------------------------------------------------------------

export function NegotiationPanel({ onClose }: { onClose: () => void }) {
  const { activeNegotiation, vote, resolveNegotiation, myId } = useMultiplayerStore()
  const neg = activeNegotiation
  if (!neg) return null

  const myVote = neg.votes[myId || '']

  return (
    <Card className="panel-elevated border-amber-500/50 bg-amber-900/20 fixed inset-0 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 border border-amber-500/50 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={24} className="text-amber-400" />
          <CardTitle className="text-base">Negotiation Required</CardTitle>
        </div>
        <div className="text-sm text-space-300 mb-4 font-semibold">{neg.title}</div>
        <p className="text-xs text-space-500 mb-6">{neg.description}</p>

        <div className="space-y-3">
          {neg.options.map((opt) => {
            const voted = Object.values(neg.votes).includes(opt.id)
            const mine = myVote === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => vote(neg.id, opt.id)}
                disabled={myVote != null}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  mine
                    ? 'border-emerald-500 bg-emerald-900/40 text-white'
                    : voted
                    ? 'border-space-700 bg-space-900/50 text-space-400 cursor-not-allowed opacity-60'
                    : 'border-amber-500/50 bg-amber-900/30 hover:border-amber-400 hover:text-white text-white'
                }`}
              >
                <div className="font-semibold">{opt.label}</div>
                <div className="text-[10px] text-space-500 mt-1">{opt.description}</div>
                {mine && <span className="ml-auto text-emerald-400 font-bold text-xs">Your vote</span>}
                {voted && !mine && <span className="ml-auto text-space-600 text-xs">Voted</span>}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[10px] text-space-500">
            Votes: {Object.keys(neg.votes).length} / {Math.min(4, neg.stakeholders.length)}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Dismiss</Button>
            <Button variant="danger" size="sm" disabled={!myVote} onClick={() => resolveNegotiation(myVote!)}>
              Commit decision
            </Button>
          </div>
        </div>
      </Card>
    </Card>
  )
}

function AlertTriangle({ size, className = '' }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  )
}
