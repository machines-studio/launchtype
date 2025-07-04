import './Poster.scss'
import { Component } from '@tooooools/ui'
import { $, persist } from '@tooooools/ui/state'

import { createDraggable, createTimeline } from 'animejs'
import { map } from 'missing-math'

import * as Constants from '/data/constants'

import CablesPatch from '/components/CablesPatch'

// Fix animejs not recognizing Inifnity
const ANIMEJS_INF = -9999

export default class Poster extends Component {
  // UI state
  state = {
    hasPointerDown: $(false),
    vw: $(10)
  }

  // Internal data store
  store = {
    words: persist(new Map(), 'poster.words', {
      encode: map => JSON.stringify(Array.from(map)),
      decode: string => new Map(JSON.parse(string))
    }),
    timeline: $(null),

    cursor: $({ x: ANIMEJS_INF, y: ANIMEJS_INF }),
    pointers: $(new Map()) // Map(<{ x, y, screenX, screenY, radius }>[])
  }

  // Cables.gl patch data
  patch = {
    words: $([
      this.store.words,
      this.props.fontColor,
      this.props.fontSize,
      this.props.fontFamily
    ], ([
      words,
      fontColor,
      fontSize,
      fontFamily
    ]) => JSON.stringify(
      Array.from(words)
        .filter(([uuid]) => this.refs.words?.has(uuid))
        .map(([, { text, position }]) => ({
          word: text,
          fontColor,
          fontSize,
          fontFamily,
          x: position ? position[0] : 0,
          y: position ? position[1] : 0,
        }))
    )),

    cursors: $([
      this.store.cursor,
      this.store.pointers,
      this.props.brushIntensity,
      this.props.brushRadius,
      this.props.brushShape,
    ], ([
      cursor,
      pointers,
      intensity,
      radius,
      shape,
    ]) => JSON.stringify([
      { ...cursor, radius, intensity, shape },
      ...pointers.values()
    ]))
  }

  beforeRender () {
    this.refs.draggables = new Map()
  }

  template (props, state) {
    return (
      <section
        class={['poster', {
          'is-playing': props.playing,
          'has-pointer-down': state.hasPointerDown
        }]}
        style={{
          '--poster-vw': this.state.vw,
          '--poster-font-size': this.props.fontSize,
          '--poster-font-family': $(this.props.fontFamily, fs => `"${fs}"`)
        }}
        event-pointerdown={this.#handlePointerDown}
        event-pointermove={this.#handlePointerMove}
        event-pointerup={this.#handlePointerUp}
      >
        <CablesPatch
          ref={this.ref('patch')}
          path='cables/patch.js'
          variables={{ ...this.patch, ...props.patch }}
        />

        <div
          ref={this.ref('wordsContainer')}
          class={['poster__words', {
            'has-debug': Constants.DEBUG_WORDS
          }]}
        />

        {Constants.DEBUG_POINTERS && (
          new Array(100).fill(true).map((_, index) => {
            const pointer = $(this.store.pointers, pointers => Array.from(pointers.values())[index])

            return (
              <div
                class='poster__pointer--debug'
                style={{
                  '--pointer-x': $(pointer, pointer => (pointer?.screenX ?? -100) + 'px'),
                  '--pointer-y': $(pointer, pointer => (pointer?.screenY ?? -100) + 'px'),
                  '--pointer-radius': $(pointer, pointer => (pointer?.radius ?? 1) + 'px')
                }}
              />
            )
          })
        )}
      </section>
    )
  }

  afterMount () {
    this.#handleParole(this.props.parole.get())
    this.props.parole.subscribe(this.#handleParole)

    window.addEventListener('resize', this.#handleResize)

    this.props.playing.subscribe(this.#handlePlay)
  }

  clear () {
    for (const [, draggable] of this.refs.draggables ?? []) draggable.stop()
    this.refs.draggables?.clear()

    for (const [, word] of this.refs.words ?? []) word.remove()
    this.refs.words?.clear()
  }

  #handleParole = parole => {
    this.clear()

    if (!parole) return
    if (!parole.timestamps) return

    // Push new words to store and render/bind
    this.store.words.update(words => {
      for (const { uuid, ...data } of parole.timestamps) {
        // Store word data
        const word = words.get(uuid) ?? { ...data, position: null }
        words.set(uuid, word)

        // Render word
        this.render((
          <div
            class='poster__word'
            id={uuid}
            ref={this.refMap(uuid, 'words')}
            innerHTML={data.text}
          />
        ), this.refs.wordsContainer)

        const updatePosition = () => {
          // Screen coordinates to normalized on [-1, 1], origin is [left, center]
          word.position = [
            map(draggable.x, draggable.containerBounds[3], draggable.containerBounds[1] + draggable.$target.clientWidth, -1, 1),
            map(draggable.y + draggable.$target.clientHeight / 2, draggable.containerBounds[0], draggable.containerBounds[2] + draggable.$target.clientHeight, -1, 1),
            map(draggable.x + draggable.$target.clientWidth, draggable.containerBounds[3], draggable.containerBounds[1] + draggable.$target.clientWidth, -1, 1)
          ]

          this.store.words.update(words => words, true)
        }

        // Bind draggable
        const draggable = createDraggable(this.refs.words.get(uuid), {
          container: this.refs.wordsContainer,
          onUpdate: updatePosition
        })
        this.refs.draggables.set(uuid, draggable)

        // Set initial position
        if (!word.position) updatePosition()
      }

      return words
    }, true)

    this.#handleResize()
  }

  #handleResize = () => {
    // Store a vw unit
    const { width } = this.base.getBoundingClientRect()
    this.state.vw.set(Math.round(width / 100) + 'px')

    // Update words position
    for (const [uuid, word] of this.store.words.get()) {
      const draggable = this.refs.draggables.get(uuid)
      if (!draggable) continue
      if (word.position) {
        // Normalized [-1, 1] to screen coordinates, origin is [left, center]
        draggable.setX(map(word.position[0], -1, 1, draggable.containerBounds[3], draggable.containerBounds[1] + draggable.$target.clientWidth))
        draggable.setY(map(word.position[1], -1, 1, draggable.containerBounds[0], draggable.containerBounds[2] + draggable.$target.clientHeight) - draggable.$target.clientHeight / 2)
      } else {
        const { left, top, height } = draggable.$target.getBoundingClientRect()
        draggable.setX(left)
        draggable.setY(top + height / 2)
      }
    }
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
    for (const [uuid, { position, ...data }] of this.store.words.get()) {
      const word = this.refs.words.get(uuid)
      const draggable = this.refs.draggables.get(uuid)
      if (!word || !draggable) continue

      const delay = data.startMs / Constants.PLAYBACK_RATE
      const duration = (data.endMs / Constants.PLAYBACK_RATE) - delay

      updateCursor({
        x: { from: position[0], to: position[2] },
        y: { from: position[1], to: position[1] },
        duration,
      }, delay)
    }

    updateCursor({ x: ANIMEJS_INF, y: ANIMEJS_INF, duration: 0 }, '<')
  }

  #handlePointerDown = e => {
    // ??? enable only when playing ? If so, force pointerup on stop
    // if (!this.props.playing.get()) return
    if (e.target.matches('.poster__word')) return

    this.base.setPointerCapture(e.pointerId)
    this.state.hasPointerDown.set(true)
    this.refs.draggables?.forEach(draggable => draggable.disable())
  }

  #handlePointerMove = e => {
    if (!this.state.hasPointerDown.get()) return

    e.preventDefault()

    this.store.pointers.update(pointers => {
      const { top, left, width, height } = this.base.getBoundingClientRect()
      pointers.set(e.pointerId, {
        // Normalized [-1, 1]
        x: map(e.clientX - left, 0, width, -1, 1),
        y: map(e.clientY - top, 0, height, -1, 1),
        // Screen coordinates
        screenX: e.clientX - left,
        screenY: e.clientY - top,
        radius: Math.max(e.width, e.height) / 2, // WIP vw
        intensity: 1
      })
      return pointers
    }, true)
  }

  #handlePointerUp = e => {
    this.store.pointers.update(pointers => {
      pointers.delete(e.pointerId)
      return pointers
    }, true)

    this.refs.draggables?.forEach(draggable => draggable.enable())
    this.state.hasPointerDown.set(false)
  }

  beforeDestroy () {
    this.clear()
    window.removeEventListener('resize', this.#handleResize)
  }
}
