// MISSION ARCHITECT — Multiplayer types
// Up to 4 players, roles, room codes, negotiation moments, hot-seat fallback.

export type PlayerRole =
  | 'mission-director'
  | 'spacecraft-engineer'
  | 'science-lead'
  | 'comms-launch-lead'

export const ROLE_LABELS: Record<PlayerRole, { label: string; color: string; accent: string }> = {
  'mission-director': {
    label: 'Mission Director',
    color: 'text-nasa-blue-glow',
    accent: 'border-nasa-blue/50 bg-nasa-blue/10',
  },
  'spacecraft-engineer': {
    label: 'Spacecraft Engineer',
    color: 'text-emerald-400',
    accent: 'border-emerald-900/50 bg-emerald-900/10',
  },
  'science-lead': {
    label: 'Science Lead',
    color: 'text-amber-400',
    accent: 'border-amber-900/50 bg-amber-900/10',
  },
  'comms-launch-lead': {
    label: 'Comms & Launch Lead',
    color: 'text-#c084fc'.replace('#c084fc', 'c084fc') as any,
    accent: 'border-purple-900/50 bg-purple-900/10',
  },
}

export interface Player {
  id: string
  name: string
  role: PlayerRole | null
  connected: boolean
  isHost: boolean
  joinedAt: number
}

export interface RoomState {
  roomCode: string | null
  hostId: string | null
  players: Player[]
  myId: string | null
  myRole: PlayerRole | null
  phase: 'lobby' | 'designing' | 'negotiating' | 'review' | 'launching' | 'operations' | 'reporting' | 'ended'
  connected: boolean
  backend: 'local' | 'websocket' | 'peerjs'
  lastSync: number
}

// Negotiation moment: a conflict between roles that must be resolved by vote
export interface Negotiation {
  id: string
  title: string
  description: string
  // The two (or more) options
  options: NegotiationOption[]
  // Which roles are involved/stakeholders
  stakeholders: PlayerRole[]
  triggeredBy: PlayerRole | null
  votes: Record<string, string> // voterId -> optionId
  resolved: boolean
  resolution: string | null // chosen optionId
  coordinationImpact: number // -20..+20 applied to coordination score
}

export interface NegotiationOption {
  id: string
  label: string
  description: string
  // Effect if chosen
  effect: {
    massDelta?: number
    powerDelta?: number
    budgetDelta?: number
    scienceDelta?: number
  }
}

// Sync message types
export type SyncMsg =
  | { type: 'join'; room: string; player: Player }
  | { type: 'leave'; playerId: string }
  | { type: 'assign-role'; playerId: string; role: PlayerRole }
  | { type: 'design-update'; field: string; value: any; playerId: string }
  | { type: 'phase-change'; phase: RoomState['phase']; playerId: string }
  | { type: 'vote'; negotiationId: string; optionId: string; voterId: string }
  | { type: 'sync-state'; state: any }
  | { type: 'ping' }
  | { type: 'pong' }

export interface MultiplayerConfig {
  wsUrl?: string // optional websocket server
  enablePeerJS?: boolean
  hotSeatFallback: boolean // always true
}
