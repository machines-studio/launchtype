import './recorder.scss'
import { $ } from '@tooooools/ui/state'
import { Button, Toolbar, Toast } from '@tooooools/ui/components'
import AudioRecorder from '/abstractions/AudioRecorder'

import * as Icons from '/data/icons'

const MAX_DURATION = 10_000 // ms

const recorder = new AudioRecorder()
const state = {
  $waiting: $(false)
}

const store = {
  $transcript: $(null)
}

export default async () => {
  await recorder.init()

  recorder.$duration.subscribe(duration => {
    if (duration >= MAX_DURATION) transcript()
  })

  return (
    <main
      id='recorder'
      class={[{
        'is-recording': recorder.$recording,
        'is-waiting': state.$waiting,
        'has-transcript': store.$transcript
      }]}
    >
      <div class='record'>
        <div
          class='record__progress'
          style={{
            '--record-progress': $(recorder.$duration, duration => (duration / MAX_DURATION).toFixed(2))
          }}
        />
        <button class='record__start' event-click={e => recorder.start()} />
        <button class='record__stop' event-click={transcript} />
      </div>

      <div class='transcript'>
        <div class='wrapper'>
          <div
            class='transcript__value'
            innerHTML={$(store.$transcript, t => t?.transcript?.transcript ?? '<silence>')}
          />

          <Toolbar class='transcript__toolbar'>
            <Button
              icon={Icons.close}
              label='annuler'
              event-click={e => store.$transcript.set(null)}
            />
            <Button
              icon={Icons.save}
              active
              label='valider'
              event-click={send}
            />
          </Toolbar>
        </div>
      </div>
    </main>
  )

  async function transcript () {
    state.$waiting.value = true
    store.$transcript.value = await recorder.transcript()
    state.$waiting.value = false
  }

  async function send () {
    // TODO broadcast via ws
    store.$transcript.set(null)

    Toast.display('Parole enregistrée', {
      icon: Icons.ok,
      duration: 3000
    })
  }
}
