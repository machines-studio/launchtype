import { $ } from '@tooooools/ui/state'
import lastOf from '/utils/array-last'

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

export function load (json) {
  const timeline = typeof json === 'string' ? JSON.parse(json) : json

  timeline.data = (() => {
    const data = new Map()
    for (const [key, value] of timeline.data) {
      data.set(key, value)
    }

    return data
  })()
    console.log(timeline.data)

  if (timeline.events.length > 1) {
    const start = timeline.events[0]
    const end = lastOf(timeline.events)
    timeline.data.set('duration', end[0] - start[0])
  }

  return timeline
}
