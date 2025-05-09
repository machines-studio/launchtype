import { $ } from '@tooooools/ui/state'

const events = new Map()
export const data = new Map()

export const isRecording = $(false)

export function start () {
  events.clear()
  isRecording.set(true)
}

export function stop () {
  isRecording.set(false)
}

export function reset () {
  stop()
  data.clear()
  events.clear()
}

export function dispatch (eventName, data) {
  if (!isRecording.get()) return
  const now = performance.now()
  const event = events.get(now) ?? []
  events.set(now, [...event, { [eventName]: data }])
}

export function toJSON () {
  return JSON.stringify({
    data: Array.from(data.entries()),
    events: Array.from(events.entries())
  })
}
