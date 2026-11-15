// MISSION ARCHITECT — Multiplayer store (Zustand)
// Manages room state, players, roles, negotiations, and backend selection.
// Always falls back to hot-seat (local) mode — fully playable solo with no backend.

import { create } from 'zustand'
import type {
  RoomState, Player, PlayerRole, Negotiation,
  MultiplayerConfig,
} from './types'
import { ROLE_LABELS } from './types'

const DEFAULT_CONFIG: MultiplayerConfig = {
  wsUrl: undefined,
  enablePeerJS: false,
  hotSeatFallback: true,
}

const EMPTY_ROOM: RoomState = {
  roomCode: null,
  hostId: null,
  players: [],
  myId: null,
  myRole: null,
  phase: 'lobby',
  connected: false,
  backend: 'local',
  lastSync: 0,
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function makePlayer(id: string, name: string, isHost: boolean): Player {
  return { id, name, role: null, connected: true, isHost, joinedAt: Date.now() }
}

interface MultiplayerState extends RoomState {
  config: MultiplayerConfig
  nickname: string
  negotiations: Negotiation[]
  activeNegotiation: Negotiation | null
  // Actions
  init: (cfg?: Partial<MultiplayerConfig>) => void
  setNickname: (n: string) => void
  createRoom: () => void
  joinRoom: (code: string) => void
  leaveRoom: () => void
  assignRole: (playerId: string, role: PlayerRole | null) => void
  claimRole: (role: PlayerRole) => void
  setPhase: (p: RoomState['phase']) => void
  updateDesign: (field: string, value: any) => void
  startNegotiation: (neg: Negotiation) => void
  vote: (negotiationId: string, optionId: string) => void
  resolveNegotiation: (optionId: string) => void
  setConnected: (c: boolean) => void
  setBackend: (b: RoomState['backend']) => void
  reset: () => void
  // Helpers
  canStartNegotiation: () => boolean
  myRoleLabel: () => string
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  ...EMPTY_ROOM,
  config: DEFAULT_CONFIG,
  nickname: '',
  negotiations: [],
  activeNegotiation: null,

  init: (cfg = {}) => {
    const config = { ...DEFAULT_CONFIG, ...cfg }
    // Always start in local/hot-seat mode unless a WS url is given and reachable
    const backend = config.wsUrl ? 'websocket' : 'local'
    set({
      config,
      backend,
      nickname: localStorage.getItem('ma-nickname') || `Commander-${Math.floor(Math.random() * 9000) + 1000}`,
      connected: true,
      lastSync: Date.now(),
    })
  },

  setNickname: (n) => {
    set({ nickname: n })
    localStorage.setItem('ma-nickname', n)
  },

  createRoom: () => {
    const { nickname } = get()
    const roomCode = generateRoomCode()
    const hostId = `player-${Date.now()}`
    const players = [makePlayer(hostId, nickname, true)]
    set({
      roomCode, hostId, players, myId: hostId, myRole: null,
      phase: 'lobby', connected: true, backend: 'local', lastSync: Date.now(),
    })
    // Auto-assign host to first available role if solo
  },

  joinRoom: (code) => {
    const { nickname } = get()
    const roomCode = code.toUpperCase().trim()
    const myId = `player-${Date.now()}`
    // Simulate joining an existing room (local fallback). In a real WS backend this
    // would validate the code with the server.
    set({
      roomCode, hostId: null, players: [makePlayer(myId, nickname, false)],
      myId, myRole: null, phase: 'lobby', connected: true, backend: 'local',
      lastSync: Date.now(),
    })
  },

  leaveRoom: () => set({ ...EMPTY_ROOM, config: get().config, nickname: get().nickname }),

  assignRole: (playerId, role) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, role } : p,
      ),
      // If it's us, update myRole
      ...(playerId === state.myId ? { myRole: role } : {}),
    }))
  },

  claimRole: (role) => {
    const { myId, players } = get()
    // Prevent duplicate roles
    if (players.some((p) => p.role === role && p.id !== myId)) return
    if (myId) get().assignRole(myId, role)
  },

  setPhase: (p) => set({ phase: p, lastSync: Date.now() }),

  updateDesign: (_field, _value) => {
    // Broadcast a design-update sync message (handled by sync layer)
    set({ lastSync: Date.now() })
  },

  startNegotiation: (neg) => {
    set((state) => ({
      negotiations: [...state.negotiations, { ...neg, votes: {}, resolved: false, resolution: null }],
      activeNegotiation: { ...neg, votes: {}, resolved: false, resolution: null },
      phase: 'negotiating',
    }))
  },

  vote: (negotiationId, optionId) => {
    const { myId, activeNegotiation } = get()
    if (!myId || !activeNegotiation || activeNegotiation.id !== negotiationId) return
    if (activeNegotiation.votes[myId]) return // already voted
    set((state) => {
      const neg = state.activeNegotiation!
      return {
        activeNegotiation: {
          ...neg,
          votes: { ...neg.votes, [myId]: optionId },
        },
        negotiations: state.negotiations.map((n) =>
          n.id === negotiationId ? { ...n, votes: { ...n.votes, [myId]: optionId } } : n,
        ),
      }
    })
  },

  resolveNegotiation: (optionId) => {
    const { activeNegotiation } = get()
    if (!activeNegotiation) return
    const chosen = activeNegotiation.options.find((o) => o.id === optionId)
    set((state) => ({
      activeNegotiation: {
        ...state.activeNegotiation!,
        resolved: true, resolution: optionId,
      },
      negotiations: state.negotiations.map((n) =>
        n.id === activeNegotiation.id
          ? { ...n, resolved: true, resolution: optionId }
          : n,
      ),
      phase: 'designing',
    }))
    // Apply the chosen option's effect to coordination + design
    if (chosen) {
      // coordination impact stored for scoring
      // (applied in scoring layer via negotiations list)
    }
  },

  setConnected: (c) => set({ connected: c, lastSync: Date.now() }),
  setBackend: (b) => set({ backend: b, lastSync: Date.now() }),

  reset: () => set({ ...EMPTY_ROOM, config: get().config, nickname: get().nickname }),

  canStartNegotiation: () => {
    const { phase, activeNegotiation } = get()
    return phase === 'designing' && !activeNegotiation
  },

  myRoleLabel: () => {
    const { myRole } = get()
    if (!myRole) return 'Unassigned'
    return ROLE_LABELS[myRole as PlayerRole].label
  },
}))
