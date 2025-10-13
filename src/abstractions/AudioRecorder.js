import { $ } from '@tooooools/ui/state'
import { raf } from '@internet/raf'

// TODO dynamic url
const API_URL = 'http://localhost:8888/save/sound'

export default class AudioRecorder {
  $recording = $(false)
  $duration = $(0)

  chunks = []
  mediaRecorder

  constructor () {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia not supported')
    }
  }

  async init (stream = undefined) {
    stream ??= await navigator.mediaDevices.getUserMedia({ audio: true })
    this.mediaRecorder = new MediaRecorder(stream)
    this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data)
  }

  tick = dt => {
    if (!this.$recording.value) return
    this.$duration.value += dt
  }

  start () {
    if (this.$recording.value) return

    this.chunks.length = 0
    this.$duration.value = 0
    this.$recording.value = true
    this.mediaRecorder.start()
    raf.add(this.tick)
  }

  stop () {
    this.mediaRecorder.stop()
    raf.remove(this.tick)
  }

  transcript = () => new Promise((resolve, reject) => {
    this.mediaRecorder.onstop = async () => {
      try {
        this.$recording.value = false

        const blob = new Blob(this.chunks, { type: 'audio/ogg; codecs=opus' })
        if (!blob.size) return

        const body = new FormData()
        body.append('sound', blob)

        const response = await fetch(API_URL, {
          headers: { Accept: 'application/json' },
          method: 'POST',
          body
        })

        if (!response || !response.ok) reject(new Error('Error while sending to API'))
        resolve(response.json())
      } catch (error) {
        reject(error)
      }
    }

    this.stop()
  })
}
