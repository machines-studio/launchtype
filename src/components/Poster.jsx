import './Poster.scss'
import { Component } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import hash from 'object-hash'
import { uid } from 'uid'
import { createDraggable, createTimeline } from 'animejs'
import { map } from 'missing-math'

import lastOf from '/utils/array-last'

import * as Constants from '/data/constants'

import { $sync } from '/controllers/WebSocket'
import CablesPatch from '/components/CablesPatch'

// Fix animejs not recognizing Inifnity
const ANIMEJS_INF = -9999

let SILENT_MOVE = false // Avoid broadcasting word movement

const persistMap = {
  encode: map => JSON.stringify(Array.from(map)),
  decode: string => new Map(JSON.parse(string))
}

export default class Poster extends Component {
  // UI state
  state = {
    hasPointerDown: $(false),
    vw: $(10)
  }

  // Internal data store
  store = {
    timeline: $(null),
    words: $sync('poster.words', {}, persistMap),
    cursor: $({ x: ANIMEJS_INF, y: ANIMEJS_INF, scale: 0 })
  }

  // Cables.gl patch data
  patch = {
    words: $([
      this.store.words,
      this.props.fontSize,
    ], ([
      words = {},
      fontSize
    ]) => JSON.stringify(
      Object.values(words)
        .filter(({ uuid }) => this.refs.words?.has(uuid))
        .map(({ text, position }) => ({
          word: text,
          fontSize,
          x: position ? position[0] : 0,
          y: position ? position[1] : 0,
        }))
    )),

    cursorX: $(this.store.cursor, c => c?.x ?? ANIMEJS_INF),
    cursorY: $(this.store.cursor, c => c?.y ?? ANIMEJS_INF),
    cursorScale: $(this.store.cursor, c => c?.scale ?? 0)
  }

  beforeRender () {
    this.refs.draggables = new Map()
  }

  template (props, state) {
    return (
      <section
        class={['poster', {
          'is-playing': props.playing,
          'show-words-bbox': props.showWordsBbox
        }]}
        style={{
          '--poster-vw': this.state.vw,
          '--poster-font-size': this.props.fontSize,
          '--poster-font-family': $(this.props.fontFamily, fs => `"${fs}"`),
          'touch-action': 'none'
        }}
      >
        {props.patch && (
          <CablesPatch
            ref={this.ref('patch')}
            path='cables/patch.js'
            variables={{ ...this.patch, ...props.patch }}
          />
        )}

        <div
          ref={this.ref('wordsContainer')}
          class={['poster__words', {
            'has-debug': props.showWords ?? Constants.DEBUG_WORDS
          }]}
        />
      </section>
    )
  }

  afterMount () {
    this.#handleParole()
    this.store.words.subscribe(this.#handleWords)
    this.props.parole.subscribe(this.#handleParole)
    this.refs.patch?.state.loaded.subscribe(this.#handleParole)
    window.addEventListener('resize', this.#handleResize)

    this.props.playing?.subscribe(this.#handlePlay)
  }

  clear ({ words = false } = {}) {
    for (const [, draggable] of this.refs.draggables ?? []) draggable.stop()
    this.refs.draggables?.clear()

    for (const [, word] of this.refs.words ?? []) word.remove()
    this.refs.words?.clear()

    this.store.words.set({})
  }

  refresh () {
    this.#handleParole()
  }

  reset () {
    this.clear({ words: true })
    this.refresh()
  }

  addWord ({
    uuid = 'word_' + uid(),
    text = null,
    position = [-1, -1],
    ...data
  } = {}, store = this.store.words) {
    if (!text) return
    if (!String(text).trim()) return

    store.update(words => {
      // Store word data
      words[uuid] = { uuid, text, position, ...data }

      // Render word
      this.render((
        <div
          class='poster__word'
          id={uuid}
          ref={this.refMap(uuid, 'words')}
          innerHTML={text.replace(/\n/g, '<br/>')}
        />
      ), this.refs.wordsContainer)

      // Bind draggable
      const draggable = createDraggable(this.refs.words.get(uuid), {
        velocityMultiplier: 0, // Disable target inertia
        containerFriction: 1, // Disable container inertia
        container: this.refs.wordsContainer,
        onUpdate: () => {
          // Screen coordinates to normalized on [-1, 1], origin is [left, top]
          words[uuid].position = [
            map(draggable.x, draggable.containerBounds[3], draggable.containerBounds[1] + draggable.$target.clientWidth, -1, 1),
            map(draggable.y, draggable.containerBounds[0], draggable.containerBounds[2] + draggable.$target.clientHeight, -1, 1),
            map(draggable.x + draggable.$target.clientWidth, draggable.containerBounds[3], draggable.containerBounds[1] + draggable.$target.clientWidth, -1, 1),
            map(draggable.y + draggable.$target.clientHeight, draggable.containerBounds[0], draggable.containerBounds[2] + draggable.$target.clientHeight, -1, 1)
          ]
          if (!SILENT_MOVE) store.set(words, true)
        }
      })

      this.refs.draggables.set(uuid, draggable)

      return words
    }, true)
  }

  popWord (store = this.store.words) {
    const [uuid] = lastOf(Array.from(store.get()))
    this.removeWord(uuid, store)
  }

  removeWord (uuid, store = this.store.words) {
    // Remove from DOM
    this.refs.words.get(uuid)?.remove()

    // Remove from refs
    this.refs.words.delete(uuid)
    this.refs.draggables.delete(uuid)

    // Remove from store
    store.update(words => {
      words.delete(uuid)
      return words
    }, true)
  }

  #handleParole = () => {
    this.clear()

    const parole = this.props.parole.get()
    if (!parole) return
    if (!parole.timestamps) return

    // Push new words to store and render/bind
    for (const index in parole.timestamps) {
      this.addWord({
        ...parole.timestamps[index],
        uuid: `${hash(parole.transcript)}_${index}`,
        position: [
          -1,
          map(+index, 0, parole.timestamps.length - 1, -0.5, 0.5)
        ],
      })
    }

    // Using RAF to fix race condition with this.ref.patch.state.loaded
    window.requestAnimationFrame(this.#handleResize)
  }

  #handleWords = () => {
    // Update words positions
    this.#handleResize()
  }

  #handleResize = () => {
    // Store a vw unit
    const { width } = this.base.getBoundingClientRect()
    this.state.vw.set(Math.round(width / 100) + 'px')

    SILENT_MOVE = true
    // Update words position
    for (const word of Object.values(this.store.words.get())) {
      const draggable = this.refs.draggables.get(word.uuid)
      if (!draggable) continue
      if (word.position) {
        // Normalized [-1, 1] to screen coordinates, origin is [left, top]
        draggable.setX(map(word.position[0], -1, 1, draggable.containerBounds[3], draggable.containerBounds[1] + draggable.$target.clientWidth))
        draggable.setY(map(word.position[1], -1, 1, draggable.containerBounds[0], draggable.containerBounds[2] + draggable.$target.clientHeight))
      } else {
        const { left, top, height } = draggable.$target.getBoundingClientRect()
        draggable.setX(left)
        draggable.setY(top + height / 2)
      }
    }

    SILENT_MOVE = false
  }

  #handlePlay = playing => {
    // Either reset stored timeline or create a new one
    this.store.timeline.update(timeline => {
      if (!playing) timeline.cancel().complete()
      else timeline?.revert()
      return createTimeline()
    })

    if (!playing) return

    const timeline = this.store.timeline.get()
    const updateCursor = (params, delay = 0) => {
      timeline.add(this.store.cursor.current, {
        ...params,
        onUpdate: () => this.store.cursor.dispatch(this.store.cursor.get())
      }, delay)
    }

    // Assuming words have been inserted in the order of their transcript
    for (const { uuid, position, ...data } of Object.values(this.store.words.get())) {
      const word = this.refs.words.get(uuid)
      const draggable = this.refs.draggables.get(uuid)
      if (!word || !draggable) continue

      const delay = data.startMs / Constants.PLAYBACK_RATE
      const duration = (data.endMs / Constants.PLAYBACK_RATE) - delay

      const y = position[1] + (position[3] - position[1]) / 2
      updateCursor({
        x: { from: position[0], to: position[2] },
        y: { from: y, to: y },
        scale: 1,
        duration,
      }, delay)
    }

    updateCursor({ x: ANIMEJS_INF, y: ANIMEJS_INF, scale: 0, duration: 100 }, '<')
  }

  beforeDestroy () {
    this.clear()
    window.removeEventListener('resize', this.#handleResize)
  }
}
