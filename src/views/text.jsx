import './text.scss'
import { render } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'
import { $ } from '@tooooools/ui/state'
import { $broadcast, $listen } from '/controllers/WebSocket'

import * as Icons from '/data/icons'
import * as Constants from '/data/constants'

import Poster from '/components/Poster'

const store = {
  $parole: $broadcast('parole'),
  $paroles: undefined // Will be init with fetched paroles during setup
}

export default async () => {
  store.$paroles = $listen('paroles', await Constants.PAROLES.fetch())

  store.$paroles.subscribe(handleParoles)
  window.setTimeout(handleParoles, 1000) // Dirty

  return (
    <main id='text'>
      <ul class='paroles' />
      <Poster /* WIP *//>
    </main>
  )

  function handleParoles () {
    const container = document.querySelector('.paroles')
    if (!container) return
    container.innerHTML = ''

    for (const parole of store.$paroles.value) {
      render((
        <Button
          icon={Icons.play}
          class='parole'
          event-click={e => store.$parole.set(parole, true)}
          active={$(store.$parole, p => p === parole)}
          label={parole.transcript.transcript}
        />
      ), container)
    }
  }
}
