import './App.scss'
import { Droppable } from '@shopify/draggable'
import { Component } from '@tooooools/ui'
import { Button, Toolbar } from '@tooooools/ui/components'
import { $, persist } from '@tooooools/ui/state'

import * as Icons from '/data/icons'
import confirm from '/controllers/Confirm'
import Poster from '/components/Poster'

const BLUEPRINTS = Object.values(import.meta.glob('/data/blueprints/*.jsx', { eager: true }))

export default class App extends Component {
  state = {
    blueprint: $(null),
    // To simplify word insertion/deletion and its draggable interface, single
    // source of truth will be the DOM (via <App>.refs.words). This internal
    // state will be updated each time the DOM is modified
    words: persist(['hello', 'world', 'lorem', 'ipsum'], 'app.words'),

    isFullscreen: $(!!document.fullscreenElement),
    hasVisibleGrid: persist(false, 'app.hasVisibleGrid')
  }

  template (props, state) {
    return (
      <main
        id='app'
        class={['app', {
          'is-fullscreen': state.isFullscreen,
          'has-visible-grid': state.hasVisibleGrid
        }]}
      >
        <section class='app__artboard'>
          <Toolbar class='app__toolbar' layout='vertical'>
            <Toolbar compact>
              <Button
                icon={Icons.up}
                class='button--prev-blueprint'
                event-click={this.#handlePreviousBlueprint}
              />
              <Button
                icon={Icons.down}
                class='button--next-blueprint'
                event-click={this.#handleNextBlueprint}
              />
            </Toolbar>

            <Toolbar>
              <Button
                icon={Icons.grid}
                active={state.hasVisibleGrid}
                event-click={state.hasVisibleGrid.toggle}
              />

              {document.body.requestFullscreen && [
                <Button
                  icon={$(state.isFullscreen, f => f ? Icons.exitFullscreen : Icons.requestFullscreen)}
                  event-click={this.#handleFullscreen}
                />
              ]}
            </Toolbar>
          </Toolbar>
          <div
            class='app__poster-container'
            ref={this.ref('posterContainer')}
          />

          <section class='app__words'>
            <div class='app__words-container' ref={this.ref('wordsContainer')} />
            <Toolbar class='app__words-toolbar'>
              <Button
                icon={Icons.plus}
                class='button--add-word'
                ref={this.ref('addWord')}
                event-click={this.#handleInsertWord}
              />

              <Button
                icon={Icons.trash}
                class='button--remove-word'
                ref={this.ref('removeWords')}
                event-click={e => confirm(this.#handleRemoveWords, {
                  title: 'Supprimer tous les mots ?',
                  message: 'Les mots déjà placés seront également supprimés.',
                  confirm: { label: 'supprimer', icon: Icons.trash }
                })}
              />
            </Toolbar>
          </section>
        </section>
      </main>
    )
  }

  get droppable () {
    return [
      ...this.refs.poster.refs.cells,
      this.refs.wordsContainer,
      this.refs.addWord.base,
      this.refs.removeWords.base
    ]
  }

  afterRender () {
    this.state.words.get().forEach(this.addWord)
    this.state.blueprint.subscribe(this.#handleBlueprint)
  }

  afterMount () {
    this.state.blueprint.set(BLUEPRINTS[0])
  }

  // Insert a word by its string
  addWord = string => {
    if (!string || !string.length) return
    this.render((
      <div class='word' ref={this.refArray('words')} tabIndex='-1'>
        {
          // Wrap each character in a <span>
          string.split('').map(c => <span class='word__char' innerText={c} />)
        }
      </div>
    ), this.refs.wordsContainer)

    this.#updateInternalWords()
  }

  // Remove a word by its element
  removeWord = (element, { dispatch = true } = {}) => {
    const index = this.refs.words.indexOf(element)
    if (index < 0) return

    element.remove()
    this.refs.words.splice(index, 1)

    if (dispatch) this.#updateInternalWords()
  }

  // Ensure state.words is up to date with DOM
  #updateInternalWords = () => {
    this.state.words.set(this.refs.words.map(el => el.innerText))
  }

  // Prompt for a string and insert words accordingly
  #handleInsertWord = async e => {
    // TODO non-native ui ?
    const result = await prompt('Entrez vos mots :')
    result && result.split(/,/).forEach(this.addWord)
  }

  #handleFullscreen = async () => {
    if (!document.fullscreenElement) await document.body.requestFullscreen()
    else await document.exitFullscreen()
    this.state.isFullscreen.set(document.fullscreenElement)
  }

  // Remove all words
  #handleRemoveWords = async () => {
    // Delete each word reference in the DOM
    for (let index = this.refs.words.length - 1; index >= 0; index--) {
      this.removeWord(this.refs.words[index], { dispatch: false })
    }
    this.#updateInternalWords()
  }

  #handleBlueprint = blueprint => {
    // Store placed words to later replace them in the new rendered Poster
    const placedWords = new Map()
    if (this.refs.poster) {
      for (const word of this.refs.poster.base.querySelectorAll('.cell .word')) {
        const cell = word.parentNode
        const index = this.refs.poster.refs.cells.indexOf(cell)
        placedWords.set(index, word)
      }
    }

    // Cleanup
    this.refs.poster?.destroy()
    this.refs.droppable?.destroy()

    // Render a new Poster
    this.render(<Poster ref={this.ref('poster')} {...blueprint} />, this.refs.posterContainer)

    // Replace previous placed words in the new poster
    for (const [index, word] of placedWords) {
      // Fallback to words container if less cells than previous poster
      ;(this.refs.poster.refs.cells[index] ?? this.refs.wordsContainer).appendChild(word)
    }

    // Instanciate draggablejs
    this.refs.droppable = new Droppable(this.droppable, {
      draggable: '.word',
      distance: 30,
      delay: { mouse: 0, drag: 0, touch: 0 },
      mirror: { appendTo: this.base },
      dropzone: this.droppable
    })

    // Implement custom mirror:move, because draggablejs does some weird offset
    this.refs.droppable.on('mirror:move', e => {
      e.cancel()
      const x = e.sensorEvent.clientX - document.documentElement.scrollLeft
      const y = e.sensorEvent.clientY - document.documentElement.scrollTop
      e.mirror.style.setProperty('--x', x + 'px')
      e.mirror.style.setProperty('--y', y + 'px')
    })

    // Prevent ADSR animation during drag
    this.refs.droppable.on('drag:start', e => {
      e.data.source.removeAttribute('style')
      for (const child of e.data.source.children) child.removeAttribute('style')
      this.refs.poster.abort(e.data.sourceContainer)
    })

    // Implement various behaviors when a word is dropped
    this.refs.droppable.on('droppable:stop', e => {
      if (!e.data.dropzone) return

      // Allow draggable to drop on occupied dropzones
      e.data.dropzone.classList.remove('draggable-dropzone--occupied')

      // Cell drop behavior : swap element with old one
      if (this.refs.poster.refs.cells.includes(e.data.dropzone)) {
        this.refs.poster.abort(e.data.dragEvent.datasourceContainer)
        this.refs.poster.refresh(e.data.dropzone)

        const existing = e.data.dropzone.querySelector('.word:not(.draggable-source--is-dragging, .draggable-mirror, .draggable--original)')
        if (existing) e.data.dragEvent.data.sourceContainer.appendChild(existing)
      }

      // Add drop behavior : clone element
      if (e.data.dropzone === this.refs.addWord.base) {
        window.requestAnimationFrame(() => {
          this.addWord(e.data.dragEvent.data.originalSource.innerText)
          e.data.dragEvent.data.sourceContainer.appendChild(e.data.dragEvent.data.originalSource)
        })
      }

      // Trash drop behavior : remove element
      if (e.data.dropzone === this.refs.removeWords.base) {
        window.requestAnimationFrame(() => {
          this.removeWord(e.data.dragEvent.data.originalSource)
        })
      }
    })
  }

  #handlePreviousBlueprint = e => {
    e.preventDefault() // Prevent double-click zoom on touch devices
    const index = BLUEPRINTS.indexOf(this.state.blueprint.get())
    this.state.blueprint.set(BLUEPRINTS[(index + BLUEPRINTS.length + 2) % BLUEPRINTS.length])
  }

  #handleNextBlueprint = e => {
    e.preventDefault() // Prevent double-click zoom on touch devices
    const index = BLUEPRINTS.indexOf(this.state.blueprint.get())
    this.state.blueprint.set(BLUEPRINTS[(index + 1) % BLUEPRINTS.length])
  }

  beforeDestroy () {
    this.refs.droppable.destroy()
  }
}
