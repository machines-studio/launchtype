import WebSocket from 'reconnectingwebsocket'
import { $ } from '@tooooools/ui/state'
import * as Constants from '/data/constants'

const ws = new WebSocket(Constants.WS_URL, null)
export const $connected = $(false)

const SIGNALS = new Map()

ws.onerror = error => { throw error }
ws.onmessage = e => {
  if (!e.data) return
  const data = JSON.parse(e.data)

  switch (data.event) {
    case 'broadcast':
      SIGNALS.get(data.name)?.set(data.value)
      break

    case 'handshake':
      $connected.value = true
      break

    default:
      console.warn(`No handler for event ${data.event}`)
  }
}

export function $broadcast (name, value) {
  const signal = $(value)
  signal.subscribe(v => ws.send(JSON.stringify({ event: 'broadcast', name, value: v })))
  return signal
}

export function $listen (name, value, decode = JSON.parse) {
  const signal = $(value)
  SIGNALS.set(name, signal)
  return signal
}

export default {
  $broadcast,
  $listen
}
