import './text.scss'
import { render } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $, not } from '@tooooools/ui/state'
import { map } from 'missing-math'
import { $sync, $broadcast, $listen } from '/controllers/WebSocket'

import * as Icons from '/data/icons'
import * as Constants from '/data/constants'

import Poster from '/components/Poster'

const state = {
  $soundPlaying: $sync('sound.playing', false),
  $soundLoading: $listen('sound.loading', false)
}

const store = {
  $parole: $sync('parole'),
  $paroles: undefined, // Will be init with fetched paroles during setup,
  $fontSize: $($listen('pad[0].x', 0), v => map(v, -1, 1, 10, 30))
}

export default async () => {
  // Fetch, bind and render paroles
  store.$paroles = $listen('paroles', await Constants.PAROLES.fetch())
  store.$paroles.subscribe(handleParoles)
  window.setTimeout(handleParoles, 1000) // Dirty

  return (
    <main id='text'>
      <aside class='paroles'>
        <Button
          class={['paroles__current', {
            'is-waiting': $([state.$soundPlaying, state.$soundLoading], ([a, b]) => a || b)
          }]}
          icon={Icons.sound}
          label={$(store.$parole, p => p?.transcript?.transcript ?? 'Sélectionnez une parole')}
          active={store.$parole}
          disabled={not(store.$parole)}
          event-click={e => $broadcast('sound.lastPlayed').set(Date.now())}
        />
        <ul class='paroles__container' />
      </aside>
      <Poster
        showWords
        fontSize={store.$fontSize}
        parole={$(store.$parole, p => p?.transcript)}
      />
    </main>
  )

  function handleParoles () {
    const container = document.querySelector('.paroles__container')
    if (!container) return
    container.innerHTML = ''

    for (const parole of store.$paroles.value) {
      render((
        <Button
          icon={Icons.selected}
          class='parole'
          event-click={e => store.$parole.set(parole, true)}
          active={$(store.$parole, p => p?.filename && p.filename === parole.filename)}
          label={parole.transcript.transcript}
        />
      ), container)
    }
  }
}
