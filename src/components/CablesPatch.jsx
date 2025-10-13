/* global CABLES */
import './CablesPatch.scss'

import { Component } from '@tooooools/ui'
import { $, Derived } from '@tooooools/ui/state'
import { uid } from 'uid'
import dirname from '/utils/dirname'

export default class CablesPatch extends Component {
  uid = 'cables-patch_' + uid()
  boundVars = new Map()

  state = {
    loaded: $(false)
  }

  template (props, state) {
    return (
      <section
        class={['cables-patch', {
          'is-loaded': state.loaded
        }]}
      >
        <script
          ref={this.ref('script')}
          async
          type='text/javascript'
          src={props.path}
        />

        <canvas
          ref={this.ref('canvas')}
          id={this.uid}
        />
      </section>
    )
  }

  afterMount () {
    window.addEventListener('resize', this.#handleResize)
    this.state.loaded.subscribe(this.#handleResize)

    document.addEventListener('CABLES.jsLoaded', this.#handleLoad)

    // Trigger manually CABLES.jsLoaded event because internally it is bound to the window load event
    this.refs.script.onload = () => {
      const e = document.createEvent('Event')
      e.initEvent('load', false, false)
      window.dispatchEvent(e)
    }
  }

  #handleResize = () => {
    const { width, height } = this.base.getBoundingClientRect()
    this.refs.patch.cgl.setSize(width, height)
    this.refs.patch.cgl.updateSize()
  }

  #handleLoad = () => {
    // Instanciate patch
    this.refs.patch = new CABLES.Patch({
      patch: CABLES.exportedPatch,
      prefixAssetPath: dirname(this.props.path) + '/',
      glCanvasId: this.uid,
      glCanvasResizeToWindow: false,
      onError: this.#handleError,
      onFinishedLoading: async () => {
        // Handle assets loading
        for (const asset of Object.values(this.refs.patch.loading._loadingAssets)) {
          await this.#handleAsset(asset)
        }

        this.state.loaded.set(true)
      },

      // Set initial variables values
      variables: Object.entries(this.props.variables).reduce((acc, [key, signal]) => ({
        ...acc,
        [key]: $(signal).get()
      }), {})
    })

    // Instanciate and bind all variables
    for (const key in this.props.variables) {
      const patchVariable = this.refs.patch.getVar(key)
      if (!patchVariable?.type) {
        console.warn(`No variable '${key}' exposed by the cables.gl patch`)
        continue
      }

      const signal = $(this.props.variables[key])

      // Write to patch
      const setValue = v => patchVariable.setValue(v)
      this.boundVars.set(signal, setValue)
      signal.subscribe(setValue)
      patchVariable.setValue(signal.get())

      // Read from patch
      patchVariable.on('change', value => {
        if (signal instanceof Derived) return
        signal.set(value)
      })
    }
  }

  #handleError = err => console.error(err)

  #handleAsset = asset => {
    switch (asset.type) {
      case 'FontFile': {
        this.render((
          <style ref={this.refArray('fonts')}>
            {`
              @font-face {
                font-family: "${asset.name.replace(/\.[^/.]+$/, '')}";
                font-display: auto;
                font-style: normal;
                font-weight: normal;
                src: url('${this.refs.patch.config.prefixAssetPath + asset.name}') format('OpenType');
              }
            `}
          </style>
        ), this.base)
      }
    }
  }

  toBlob = (type, quality) => new Promise(resolve => this.refs.canvas.toBlob(resolve, type, quality))

  beforeDestroy () {
    this.refs.patch?.dispose()
    for (const [signal, setValue] of this.boundVars) signal.unsubscribe(setValue)

    document.removeEventListener('CABLES.jsLoaded', this.#handleLoad)
    window.removeEventListener('resize', this.#handleResize)
  }
}
