/* global __REPOSITORY_URL__, __VERSION__ */

import './App.scss'
import { Component } from '@tooooools/ui'
import { $, persist, not } from '@tooooools/ui/state'
import { Howl } from 'howler'
import { Convert } from '@tooooools/utils'

import dirname from '/utils/dirname'
import basename from '/utils/basename'

import * as Icons from '/data/icons'
import * as Constants from '/data/constants'

import confirm from '/controllers/confirm'

import { Button, Select, Toolbar } from '@tooooools/ui/components'
import Poster from '/components/Poster'
import Pad from '/components/Pad'

const PAROLES = Object.entries(import.meta.glob('@assets/paroles/**/*.json', { eager: true }))
  .map(([filename, json]) => ({
    group: basename(dirname(filename)),
    label: json.default.transcript.toLowerCase().substr(0, Constants.PAROLES_LABEL_MAX_LENGTH).trim() + (json.default.transcript.length > Constants.PAROLES_LABEL_MAX_LENGTH ? '…' : ''),
    value: json.default
  }))

export default class App extends Component {
  // UI state
  state = {
    parole: import.meta.env.DEV
      ? persist(null, 'app.state.parole')
      : $(null), // Avoid Howler "HTML5 audio pool exhausted error" on Safari
    playing: $(false),
    loading: $(false),
  }

  // Internal data store
  store = {
    sound: $(this.state.parole, async parole => {
      if (!parole || !parole.sound) return
      return new Promise(resolve => {
        this.state.loading.set(true)
        const sound = new Howl({
          src: parole.sound,
          preload: true,
          html5: true,
          rate: Constants.PLAYBACK_RATE,
          onplay: () => this.state.playing.set(true),
          onstop: () => this.state.playing.set(false),
          onend: () => this.state.playing.set(false),
          onload: () => {
            this.state.loading.set(false)
            resolve(sound)
          }
        })
      })
    }),

    brushIntensity: $(null),
    brushRadius: $(null),
    brushShape: $(null),
    fontColor: $(null),
    fontFamily: $(null),
    fontSize: $(null),

    multA: $(1),
    multB: $(1),
    colors: new Array(Constants.PATCH_GRADIENTS_COLOR_LENGTH).fill(true).map(() => $([0, 0, 0]))
  }

  // Cables.gl patch data
  patch = {
    sidebarView: +(Constants.SHOW_CABLE_UI),
    textBlendMode: $(Constants.CABLE_BLEND_MODE_NORMAL),
    maxPixelDensity: window.devicePixelRatio ?? 1,
    gradients: $([
      this.store.multA,
      this.store.multB,
      ...this.store.colors,
    ], ([multA, multB, ...colors]) => JSON.stringify({
      multA,
      multB,
      // colorA, B, C, etc…
      ...colors.reduce((acc, cur, index) => ({
        ...acc,
        ['color' + String.fromCharCode(65 + index)]: cur
      }), {})
    }))
  }

  template (props, state) {
    return (
      <main class='app'>
        <Toolbar class='app__toolbar'>
          <Button
            icon={$(state.playing, p => p ? Icons.stop : Icons.play)}
            waiting={this.state.loading}
            disabled={not(this.store.sound)}
            event-click={this.#handlePlay}
          />

          <Select
            value={state.parole}
            label={
              $(state.parole, parole => parole?.transcript
                ? '«\u2009' + parole.transcript.toLowerCase() + '\u2009»'
                : parole?.label
              )
            }
            options={[
              { label: 'Sélectionner une parole', selected: true },
              Select.separator,
              ...PAROLES
            ]}
            compare={(a, b) => JSON.stringify(a) === JSON.stringify(b)}
          />

          <Button
            icon={Icons.reset}
            disabled={not(state.parole)}
            event-click={e => confirm(this.#handleReset, {
              title: 'Réinitialiser la position des mots ?',
              confirm: { label: 'réinitialiser' }
            })}
          />

          <Button
            icon={Icons.save}
            disabled={not(state.parole)}
            event-click={this.#handleSave}
          />
        </Toolbar>

        <section class='app__artboard'>
          <Poster
            ref={this.ref('poster')}
            playing={state.playing}
            parole={state.parole}
            patch={this.patch}
            brushIntensity={this.store.brushIntensity}
            brushRadius={this.store.brushRadius}
            brushShape={this.store.brushShape}
            fontColor={this.store.fontColor}
            fontSize={this.store.fontSize}
            fontFamily={this.store.fontFamily}
          />

          <aside class='app__sidebar'>
            <section class='app__pads'>
              <Pad
                label='typographie'
                maps={[
                  { value: this.store.brushIntensity, src: 'pad-maps/brush-intensity.png', mode: 'value' },
                  { value: this.store.brushRadius, src: 'pad-maps/brush-radius.png', mode: 'value', range: [5, 25] }, // vw
                  { value: this.store.brushShape, src: 'pad-maps/brush-shape.png', mode: 'value' },

                  { value: this.store.fontFamily, src: 'pad-maps/font-family.png', mode: 'enum', enumValues: ['Milling-Triplex1mm', 'Milling-Duplex1mm'] },
                  { value: this.store.fontSize, src: 'pad-maps/font-size.png', mode: 'value', range: [10, 30] }, // vw
                ].map(data => ({
                  ...data,
                  debug: Boolean(Constants.DEBUG_PAD_MAP.find(padMap => data.src.includes(padMap)))
                }))}
              />

              <Pad
                label='couleurs'
                maps={[
                  { value: this.patch.textBlendMode, src: 'pad-maps/font-color.png', mode: 'enum', enumValues: [Constants.CABLE_BLEND_MODE_NORMAL, Constants.CABLE_BLEND_MODE_SCREEN] },
                  { value: this.store.fontColor, src: 'pad-maps/font-color.png', mode: 'rgb' },
                  { value: this.store.multA, src: 'pad-maps/mult-a.png', mode: 'value' },
                  { value: this.store.multB, src: 'pad-maps/mult-b.png', mode: 'value' },
                  ...this.store.colors.map((color, index) => ({
                    value: color,
                    src: `pad-maps/gradient-${index + 1}.png`,
                    mode: 'rgb'
                  }))
                ].map(data => ({
                  ...data,
                  debug: Boolean(Constants.DEBUG_PAD_MAP.find(padMap => data.src.includes(padMap)))
                }))}
              />
            </section>

            <footer class='app__footer'>
              <ul>
                <li><a href={__REPOSITORY_URL__} target='_blank' rel='noreferrer'>launchtype@{__VERSION__}</a></li>
                <li><a href='https://machines.studio' target='_blank' rel='noreferrer'>made by machines</a></li>
              </ul>
            </footer>
          </aside>
        </section>
      </main>
    )
  }

  afterRender () {
    // Ensure sound is stopped when parole changes
    this.state.parole.subscribe(() => this.store.sound.get()?.stop())
  }

  #handlePlay = e => {
    const sound = this.store.sound.get()
    if (!sound) return

    if (this.state.playing.get()) sound.stop()
    else sound.play()
  }

  #handleReset = e => {
    this.refs.poster.store.words.update(words => {
      // Remove all current store words
      for (const [uuid] of words) {
        if (!this.refs.poster.refs.words.has(uuid)) continue
        words.delete(uuid)
      }

      this.refs.poster.refresh()
    }, true)
  }

  #handleSave = async e => {
    // Get the poster image
    const blob = await this.refs.poster.refs.patch.toBlob()
    const dataURL = await Convert.blob(blob).toDataURL()

    const body = new FormData()
    body.append('png', dataURL)
    body.append('json', JSON.stringify(this.toJSON()))

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.responseType = 'json'

      // Handle response
      request.onreadystatechange = () => {
        if (request.readyState !== 4) return

        if (request.response.error) {
          reject(new Error(`[${request.status}] ${request.statusText}\n${request.response.message}`))
        } else {
          resolve(request.response)
        }
      }

      // Send request
      request.open('POST', window.location.origin + '/save')
      request.send(body)
    })
  }

  toJSON = () => ({
    parole: this.state.parole.get(),
    brushIntensity: this.store.brushIntensity.get(),
    brushRadius: this.store.brushRadius.get(),
    brushShape: this.store.brushShape.get(),
    fontColor: this.store.fontColor.get(),
    fontFamily: this.store.fontFamily.get(),
    fontSize: this.store.fontSize.get(),
    multA: this.store.multA.get(),
    multB: this.store.multB.get(),
    colors: this.store.colors.map(color => color.get()),
    words: Array.from(this.refs.poster.store.words.get()?.values())
  })
}
