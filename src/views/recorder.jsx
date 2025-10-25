import './recorder.scss'
import { $ } from '@tooooools/ui/state'
import { Button, Toolbar, Toast } from '@tooooools/ui/components'
import { $sync } from '/controllers/WebSocket'

import AudioRecorder from '/abstractions/AudioRecorder'

import * as Constants from '/data/constants'
import * as Icons from '/data/icons'

const MAX_DURATION = 3_000 // ms

const recorder = new AudioRecorder()
const state = {
  $waiting: $(false)
}

const store = {
  $parole: $(null),
  $paroles: undefined // Will be init with fetched paroles during setup
}

export default async () => {
  await recorder.init()
  store.$paroles = $sync('paroles', await Constants.PAROLES.fetch())

  recorder.$duration.subscribe(duration => {
    if (duration >= MAX_DURATION) transcript()
  })

  return (
    <main
      id='recorder'
      class={[{
        'is-recording': recorder.$recording,
        'is-waiting': state.$waiting,
        'has-transcript': store.$parole
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
            innerHTML={$(store.$parole, t => t?.transcript?.transcript ?? '<silence>')}
          />

          <Toolbar class='transcript__toolbar'>
            <Button
              icon={Icons.close}
              label='annuler'
              event-click={e => store.$parole.set(null)}
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
    store.$parole.value = await recorder.transcript(Constants.API_URL + '/transcript/prepare')
    state.$waiting.value = false
  }

  async function send () {
    await fetch(Constants.API_URL + '/transcript/commit', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(store.$parole.value)
    })

    store.$paroles.update(paroles => [
      ...paroles,
      store.$parole.value
    ], true)

    store.$parole.set(null)

    Toast.display('Parole enregistrée', {
      icon: Icons.ok,
      duration: 3000
    })
  }
}
