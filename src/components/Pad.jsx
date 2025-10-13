import './Pad.scss'
import { Component } from '@tooooools/ui'
import { $, placeholder } from '@tooooools/ui/state'
import { raf } from '@internet/raf'
import { normalize, clamp, map as mapValue } from 'missing-math'
import pointer from '/utils/pointer-position'
import distSq from '/utils/distance-squared'
import smooth from 'smooth-polyline'

const TRAIL_LENGTH = 20 // points
const TRAIL_WIDTH = 30 // px
const TRAIL_SIZE = 30 // px

export default class Pad extends Component {
  // UI state
  state = {
    dragging: $(false),
    loading: placeholder(),
  }

  // Internal data store
  store = {
    padding: $(0), // Will be set in afterMount
    value: $([0.5, 0.5]), // normalized [0;1]
  }

  template (props, state) {
    return (
      <section
        class={['pad', { 'is-loading': state.loading }]}
        style='touch-action: none'
        event-pointerdown={this.#handleDown}
        event-pointermove={this.#handleMove}
        event-pointerup={this.#handleUp}
      >
        {props.label && <label innerHTML={props.label} />}
        {props.labelX && <label data-axis='x' innerHTML={props.labelX} />}
        {props.labelY && <label data-axis='y' innerHTML={props.labelY} />}
        {props.trail && <canvas ref={this.ref('canvas')} />}

        <div
          ref={this.ref('cursor')}
          class={['pad__cursor', { 'is-dragging': state.dragging }]}
        />

        {
          props.maps.map(map => (<PadMap ref={this.refArray('maps')} {...map} />))
        }

      </section>
    )
  }

  get style () { return window.getComputedStyle(this.base) }

  afterRender () {
    const loading = $(this.refs.maps.map(map => map.state.loaded), loadeds => !(loadeds.find(l => !l) ?? true))
    this.state.loading.fill(loading, true)
    this.state.loading.subscribe(this.#handleResize)

    this.store.value.subscribe(this.#handleValue)

    window.addEventListener('resize', this.#handleResize)
  }

  afterMount () {
    const { width, height } = this.base.getBoundingClientRect()

    // Compute padding based on the CSS property --pad-dots
    const dots = +this.style.getPropertyValue('--pad-dots')
    const padding = width / (dots + 1)
    this.store.padding.set(padding)

    if (this.refs.canvas) {
      this.refs.canvas.width = width
      this.refs.canvas.height = height

      this.context = this.refs.canvas.getContext('2d')
      this.context.strokeStyle = this.props.trail
      this.context.lineWidth = TRAIL_WIDTH
      this.context.lineCap = 'round'
      this.context.lineJoin = 'round'

      raf.add(this.tick)
    }
  }

  tick = dt => {
    if (!this.context) return
    this.context.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)

    // Push to trail
    this.trailPoints ??= []
    const point = [this.x, this.y]
    this.trailPoints.push(point)
    if (this.trailPoints.length > TRAIL_LENGTH) this.trailPoints.shift()

    // Render trail
    this.context.beginPath()
    let len = 0
    const points = smooth(smooth(this.trailPoints))
    for (let index = 0; index < points.length; index++) {
      const a = points[index]
      const b = points[index - 1] ?? a

      this.context.moveTo(a[0], a[1])
      this.context.lineTo(b[0], b[1])
      len += distSq(a, b)
    }

    // Trail opacity is based on total length
    this.context.globalAlpha = normalize(len, 0, TRAIL_SIZE * TRAIL_SIZE, true)
    this.context.stroke()
  }

  moveCursor (x, y) {
    window.requestAnimationFrame(() => {
      const { width, height } = this.base.getBoundingClientRect()
      const padding = this.store.padding.get() ?? 0

      this.x = clamp(x, padding, width - padding)
      this.y = clamp(y, padding, height - padding)

      this.refs.cursor.style.setProperty('--drag-x', this.x + 'px')
      this.refs.cursor.style.setProperty('--drag-y', this.y + 'px')

      // Update internal cursor value
      this.store.value.set([
        normalize(x, padding, width - padding),
        normalize(y, padding, height - padding)
      ])
    })
  }

  #handleValue = ([nx, ny]) => {
    // Update props maps
    for (let index = 0; index < this.refs.maps.length; index++) {
      const map = this.refs.maps[index]
      const {
        value,
        transform = v => v,
        range = [0, 1],
        mode = 'rgb',
        enumValues
      } = this.props.maps[index]

      value.update(() => {
        const value = (() => {
          switch (mode) {
            case 'rgb': return map.getColorAt(nx, ny)
            case 'value': return mapValue(map.getValueAt(nx, ny), 0, 1, range[0], range[1])
            case 'enum': return enumValues[Math.floor(map.getValueAt(nx, ny) * enumValues.length)]
            default: throw new Error(`Unkown PadMap mode '${mode}'`)
          }
        })()

        return transform(value)
      }, true)
    }
  }

  #handleDown = e => {
    this.base.setPointerCapture(e.pointerId)
    this.state.dragging.set(true)
    this.#handleMove(e)
  }

  #handleMove = e => {
    if (!this.state.dragging.get()) return
    const [x, y] = pointer(e)
    const { top, left } = this.base.getBoundingClientRect()
    this.moveCursor(x - left, y - top)
  }

  #handleUp = e => {
    this.state.dragging.set(false)
  }

  #handleResize = () => {
    const { width, height } = this.base.getBoundingClientRect()
    const padding = this.store.padding.get()

    // Initialize cursor position based on stored value
    const [nx, ny] = this.store.value.get() ?? [0.5, 0.5]
    this.moveCursor(padding + nx * (width - padding * 2), padding + ny * (height - padding * 2))
  }

  beforeDestroy () {
    window.removeEventListener('resize', this.#handleResize)
  }
}

class PadMap extends Component {
  template = props => <canvas class={['pad-map', { debug: props.debug }]} />

  state = {
    loaded: $(false)
  }

  store = {
    context: null,
    data: null
  }

  afterMount () {
    // Prepare context
    this.base.width = this.base.clientWidth
    this.base.height = this.base.clientHeight
    this.store.context = this.base.getContext('2d', { willReadFrequently: true })

    // Render image to canvas
    const image = new Image()
    image.onload = () => {
      this.store.context.drawImage(image, 0, 0, this.base.width, this.base.height)
      this.state.loaded.set(true)
    }
    image.crossOrigin = 'Anonymous'
    image.src = this.props.src
  }

  // IMPORTANT color is normalized by default
  getColorAt (nx, ny) {
    const x = clamp(Math.floor(nx * this.base.width), 0, this.base.width - 1)
    const y = clamp(Math.floor(ny * this.base.height), 0, this.base.height - 1)
    const { data } = this.store.context.getImageData(x, y, 1, 1)
    return [data[0] / 256, data[1] / 256, data[2] / 256, data[3] / 256]
  }

  getValueAt (nx, ny) {
    return this.getColorAt(nx, ny)[0]
  }

  beforeDestroy () {
    raf.remove(this.tick)
  }
}
