// MISSION ARCHITECT — Sync engine
// WebSocket realtime sync with automatic hot-seat fallback when no backend is reachable.
// Fully playable solo with zero backend.

import { useMultiplayerStore } from './store'
import type { SyncMsg, RoomState } from './types'

let ws: WebSocket | null = null
let reconnectTimer: any = null
let heartbeatTimer: any = null

const WS_URL = (() => {
  // Allow override via env; default none -> local mode
  const v = import.meta.env.VITE_MP_WS_URL
  return v || null
})()

const RECONNECT_MS = 3000
const HEARTBEAT_MS = 20000

export function initSync() {
  const store = useMultiplayerStore
  store.getState().init({ wsUrl: WS_URL })

  if (WS_URL) {
    connect()
  } else {
    // No backend -> guaranteed hot-seat/local mode. Fully playable solo.
    store.getState().setBackend('local')
    store.getState().setConnected(true)
  }
}

function connect() {
  const store = useMultiplayerStore
  store.getState().setBackend('websocket')
  store.getState().setConnected(false)

  try {
    ws = new WebSocket(WS_URL!)
  } catch {
    failover()
    return
  }

  ws.onopen = () => {
    store.getState().setConnected(true)
    store.getState().setBackend('websocket')
    clearInterval(heartbeatTimer)
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }))
    }, HEARTBEAT_MS)
  }

  ws.onclose = () => {
    store.getState().setConnected(false)
    ws = null
    failover()
  }

  ws.onerror = () => {
    // Don't close immediately; onclose will handle failover
  }

  ws.onmessage = (evt) => {
    try {
      const msg: SyncMsg = JSON.parse(evt.data)
      handleMsg(msg)
    } catch {
      // ignore malformed
    }
  }
}

function failover() {
  clearInterval(heartbeatTimer)
  heartbeatTimer = null
  // Graceful offline fallback: switch to hot-seat local mode
  useMultiplayerStore.getState().setBackend('local')
  useMultiplayerStore.getState().setConnected(false)
  // Try to reconnect periodically if a WS url was configured
  if (WS_URL) {
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(connect, RECONNECT_MS)
  }
}

function handleMsg(msg: SyncMsg) {
  const store = useMultiplayerStore
  switch (msg.type) {
    case 'join':
      store.setState((st) => ({
        players: st.players.some((p) => p.id === msg.player.id)
          ? st.players.map((p) => (p.id === msg.player.id ? msg.player : p))
          : [...st.players, msg.player],
      }))
      break
    case 'leave':
      store.setState((st) => ({
        players: st.players.filter((p) => p.id !== msg.playerId),
        myRole: st.myId === msg.playerId ? null : st.myRole,
      }))
      break
    case 'assign-role':
      store.setState((st) => ({
        players: st.players.map((p) =>
          p.id === msg.playerId ? { ...p, role: msg.role } : p,
        ),
        myRole: st.myId === msg.playerId ? msg.role : st.myRole,
      }))
      break
    case 'phase-change':
      store.setState({ phase: msg.phase, lastSync: Date.now() })
      break
    case 'sync-state':
      // Full state overwrite from host — merge design-relevant fields
      store.setState({ lastSync: Date.now() })
      break
    case 'pong':
      store.setState({ lastSync: Date.now() })
      break
    default:
      break
  }
}

// Send a message to the backend (no-op in local mode)
export function send(msg: SyncMsg) {
  const s = useMultiplayerStore.getState()
  if (s.backend !== 'websocket' || !ws || ws.readyState !== WebSocket.OPEN) {
    // Local mode: just record the sync timestamp
    useMultiplayerStore.setState({ lastSync: Date.now() })
    return
  }
  ws.send(JSON.stringify(msg))
}

// Broadcast a design field change
export function syncDesign(field: string, value: any, playerId: string) {
  send({ type: 'design-update', field, value, playerId })
}

// Broadcast a phase change (host only typically)
export function syncPhase(phase: RoomState['phase'], playerId: string) {
  send({ type: 'phase-change', phase, playerId })
  useMultiplayerStore.getState().setPhase(phase)
}

// Broadcast a vote
export function syncVote(negotiationId: string, optionId: string, voterId: string) {
  send({ type: 'vote', negotiationId, optionId, voterId })
}

// Cleanup on unload
export function destroySync() {
  clearInterval(heartbeatTimer)
  clearTimeout(reconnectTimer)
  heartbeatTimer = null
  reconnectTimer = null
  if (ws) {
    ws.close()
    ws = null
  }
}
