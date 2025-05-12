import './Poster.scss'
import { Component } from '@tooooools/ui'
import { $ } from '@tooooools/ui/state'

import * as Timeline from '/controllers/Timeline'

const row = size => (children = [], props = {}) => (
  <div
    {...props}
    class={['row', props.class]}
    data-size={size}
  >
    {children}
  </div>
)

const cell = align => (fx, selector = '.word') => (
  <div
    class='cell'
    tabIndex='-1'
    data-align={align}
    data-adsr={fx}
    data-adsr-selector={selector}
  />
)

export const S = row('small')
export const M = row('medium')
export const L = row('large')
export const AUTO = row('auto')
export const left = cell('left')
export const right = cell('right')
export const center = cell('center')

export default class Poster extends Component {
  state = {
    fontScale: $(1)
  }

  template (props, state) {
    return (
      <section
        class={['poster', props.style?.poster]}
        data-name={props.name}
        style={{
          '--user-font-scale': state.fontScale
        }}
      >
        <div class='row js-auto-unit' data-size='small' ref={this.ref('autoUnitRow')} />
        {props.layout.map(row => {
          for (const child of row.children) {
            if (!child.props.class.includes('cell')) continue
            child.props.ref = this.refArray('cells')
            child.props['event-mousedown'] = this.#handleDown
            // child.props['event-touchenter'] = this.#handleDown
            child.props['event-touchstart'] = this.#handleDown
            child.props['event-mouseup'] = this.#handleUp
            child.props['event-touchend'] = this.#handleUp
          }
          return row
        })}
      </section>
    )
  }

  afterRender () {
    Timeline.data.set('blueprint', this.props.name)
  }

  afterMount () {
    // Compute row[data-size='auto'] height based on a dummy small row
    const unit = this.refs.autoUnitRow.clientHeight
    this.refs.autoUnitRow.remove()
    delete this.refs.autoUnitRow
    for (const auto of this.base.querySelectorAll('.row[data-size="auto"]')) {
      auto.style.setProperty('--row-factor', auto.clientHeight / unit)
    }

    // Prepare all cells
    for (const cell of this.refs.cells) this.refresh(cell)
  }

  refresh = cell => {
    if (!cell) return
    const adsr = this.props.effects[cell.dataset.adsr]
    if (!adsr) return

    adsr.prepare(cell, cell, { force: true })
    adsr.prepare(cell, cell.dataset.adsrSelector ?? cell, { force: true })
  }

  abort = cell => {
    if (!this.refs.cells.includes(cell)) return
    const adsr = this.props.effects[cell.dataset.adsr]
    if (!adsr) return

    cell?.adsr.destroy()
  }

  #handleDown = e => {
    const cell = e.currentTarget
    if (!cell.children.length) return

    const adsr = this.props.effects[cell.dataset.adsr]
    if (!adsr) return

    Timeline.dispatch('down', this.refs.cells.indexOf(cell))
    adsr.prepare(cell, cell.dataset.adsrSelector ?? cell, { force: false })
    adsr.start(cell, cell.dataset.adsrSelector ?? cell)
  }

  #handleUp = e => {
    const cell = e.currentTarget
    if (!cell.children.length) return

    const adsr = this.props.effects[cell.dataset.adsr]
    if (!adsr) return

    Timeline.dispatch('up', this.refs.cells.indexOf(cell))
    adsr.stop(cell, cell.dataset.adsrSelector ?? cell)
  }

  beforeDestroy () {
    for (const cell of this.refs.cells) cell.adsr?.destroy()
  }
}
