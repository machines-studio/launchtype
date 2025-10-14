import './poster.scss'
import { $ } from '@tooooools/ui/state'
import { map } from 'missing-math'
import { Howl } from 'howler'

import * as Constants from '/data/constants'
import { $listen, $broadcast, $sync } from '/controllers/WebSocket'
import Poster from '/components/Poster'

const MIN_FONTSIZE = 10
const MAX_FONTSIZE = 30

const state = {
  $soundPlaying: $sync('sound.playing', false),
  $soundLoading: $broadcast('sound.loading', false)
}

const store = {
  $parole: $listen('parole'),
  $fontSize: $($listen('pad[0].x', 0), v => map(v, -1, 1, MIN_FONTSIZE, MAX_FONTSIZE)),
  $sound: $($listen('parole'), async (parole, previous) => {
    previous?.stop()
    if (!parole?.filename) return
    return new Promise(resolve => {
      state.$soundLoading.set(true)
      const sound = new Howl({
        src: Constants.SERVER_URL + '/sound/' + parole.filename,
        preload: true,
        html5: true,
        rate: Constants.PLAYBACK_RATE,
        onplay: () => state.$soundPlaying.set(true),
        onstop: () => state.$soundPlaying.set(false),
        onend: () => state.$soundPlaying.set(false),
        onload: () => {
          state.$soundLoading.set(false)
          resolve(sound)
        }
      })
    })
  })
}

const patch = {
  /* Your variables here */
  x1: $listen('pad[0].x', 0),
  y1: $listen('pad[0].y', 0),
  x2: $listen('pad[1].x', 0),
  y2: $listen('pad[1].y', 0)
}

export default () => {
  $listen('sound.lastPlayed').subscribe(() => {
    if (!store.$sound?.value) return
    store.$sound.value.stop()
    store.$sound.value.play()
  })

  return (
    <main
      id='poster'
      class={[{ 'is-loading': WebSocket.$connected }]}
    >
      <Poster
        patch={patch}
        parole={$(store.$parole, p => p?.transcript)}
        playing={state.$soundPlaying}
        fontSize={store.$fontSize}
      />
    </main>
  )
}
