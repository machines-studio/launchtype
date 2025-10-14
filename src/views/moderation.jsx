import './moderation.scss'
import { render } from '@tooooools/ui'
import { Button } from '@tooooools/ui/components'

import confirm from '/controllers/confirm'
import { $sync } from '/controllers/WebSocket'

import * as Icons from '/data/icons'
import * as Constants from '/data/constants'

const store = {
  $paroles: undefined, // Will be init with fetched paroles during setup
}

export default async () => {
  // Fetch, bind and render paroles
  store.$paroles = $sync('paroles', await Constants.PAROLES.fetch())
  store.$paroles.subscribe(handleParoles)
  window.setTimeout(handleParoles, 1000) // Dirty

  return (
    <main id='moderation'>
      <ul class='paroles' />
    </main>
  )

  function handleParoles () {
    const container = document.querySelector('.paroles')
    if (!container) return
    container.innerHTML = ''

    for (const parole of store.$paroles.value) {
      render((
        <Button
          icon={Icons.trash}
          class='parole'
          event-click={e => confirm(async () => {
            await fetch(Constants.API_URL + '/transcript/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parole)
            })

            store.$paroles.update(paroles => {
              const index = paroles.findIndex(p => p.transcript.transcript === parole.transcript.transcript)
              paroles.splice(index, 1)
              return paroles
            }, true)
          }, {
            title: 'Supprimer la parole ?',
            message: 'Cette action ne pourra pas être annulée.',
            confirm: {
              label: 'Supprimer',
              icon: Icons.trash
            }
          })}
          label={parole.transcript.transcript}
        />
      ), container)
    }
  }
}
