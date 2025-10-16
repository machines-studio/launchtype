import WebSocket from 'reconnectingwebsocket'
import { $ } from '@tooooools/ui/state'
import { uid } from 'uid'
import * as Constants from '/data/constants'

const ws = new WebSocket(Constants.WS_URL, null)
export const $connected = $(false)

const UID = uid()
const SIGNALS = {
  synceds: new Map(),
  listeners: new Map()
}

ws.onerror = error => { throw error }
ws.onmessage = e => {
  if (!e.data) return
  const data = JSON.parse(e.data)

  switch (data.event) {
    case 'broadcast': {
      // if (data.from === UID) return
      for (const pool of [SIGNALS.listeners, SIGNALS.synceds]) {
        const signal = pool.get(data.name)

        if (!signal) continue
        if (signal.wsDispatch) signal.unsubscribe(signal.wsDispatch)
        signal.set(data.value)
        if (signal.wsDispatch) signal.subscribe(signal.wsDispatch)
      }
      break
    }

    case 'handshake': {
      $connected.value = true
      break
    }

    default:
      console.warn(`No handler for event ${data.event}`)
  }
}

export function $broadcast (name, value) {
  const signal = $(value)
  signal.wsDispatch = v => {
    if (!$connected.value) return
    ws.send(JSON.stringify({
      event: 'broadcast',
      name,
      value: v,
      from: UID
    }))
  }
  signal.subscribe(signal.wsDispatch)
  return signal
}

export function $listen (name, value) {
  if (SIGNALS.listeners.has(name)) return SIGNALS.listeners.get(name)

  const signal = $(value)
  SIGNALS.listeners.set(name, signal)
  return signal
}

export function $sync (name, value) {
  if (SIGNALS.synceds.has(name)) return SIGNALS.synceds.get(name)

  const signal = $broadcast(name, value)
  SIGNALS.synceds.set(name, signal)
  return signal
}

export default {
  $broadcast,
  $listen,
  $sync
}
