import './App.scss'
import { Droppable } from '@shopify/draggable'
import { Component } from '@tooooools/ui'
import { Button, Toolbar } from '@tooooools/ui/components'
import { persist } from '@tooooools/ui/state'

import * as Icons from '/data/icons'
import confirm from '/controllers/Confirm'
import Poster from '/components/Poster'

export default class App extends Component {
  state = {
    // To simplify word insertion/deletion and its draggable interface, single
    // source of truth will be the DOM (via <App>.refs.words). This internal
    // state will be updated each time the DOM is modified
    words: persist(['hello', 'world', 'lorem', 'ipsum'], 'app.words')
  }

  template (props, state) {
    return (
      <main id='app' class='app'>
        <Poster ref={this.ref('poster')} />

        <section class='app__sidebar'>
          <section
            class='app__words'
            ref={this.ref('wordsContainer')}
          >
            <Button
              icon={Icons.plus}
              class='button--add-word'
              event-click={this.#handleInsertWord}
            />
          </section>

          <Toolbar class='app__toolbar'>
            <Button
              // TODO randomize style
              icon={Icons.shuffle}
            />

            <Button
              icon={Icons.trash}
              class='button--remove-word'
              ref={this.ref('removeWords')}
              event-click={e => confirm(this.#handleRemoveWords, {
                title: 'Supprimer tous les mots ?',
                confirm: { label: 'supprimer', icon: Icons.trash }
              })}
            />
          </Toolbar>
        </section>
      </main>
    )
  }

  afterRender (props) {
    // Load stored words
    this.state.words.get().forEach(this.addWord)
  }

  afterMount () {
    // Instanciate draggable with dropzones
    const containers = [
      ...this.refs.poster.refs.cells,
      this.refs.wordsContainer,
      this.refs.removeWords.base
    ]

    this.refs.droppable = new Droppable(containers, {
      draggable: '.word',
      distance: 10,
      dropzone: containers
    })

    // Implement various behaviors when a word is dropped
    this.refs.droppable.on('droppable:stop', e => {
      if (!e.data.dropzone) return

      // Cell drop behavior : swap element with old one
      if (this.refs.poster.refs.cells.includes(e.data.dropzone)) {
        // Allow draggable to drop on occupied dropzones
        e.data.dropzone.classList.remove('draggable-dropzone--occupied')
        const existing = e.data.dropzone.querySelector('.word:not(.draggable-source--is-dragging, .draggable-mirror, .draggable--original)')
        if (existing) e.data.dragEvent.data.sourceContainer.appendChild(existing)
      }

      // Trash drop behavior : remove element
      if (e.data.dropzone === this.refs.removeWords.base) {
        window.requestAnimationFrame(() => {
          this.removeWord(e.data.dragEvent.data.originalSource)
        })
      }
    })
  }

  // Insert a word by its string
  addWord = string => {
    if (!string || !string.length) return
    this.render((
      <div class='word' ref={this.refArray('words')}>
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
    const result = await prompt('word ?')
    result && result.split(/\W/).forEach(this.addWord)
  }

  // Remove all words
  #handleRemoveWords = async () => {
    // Delete each word reference in the DOM
    // ??? Remove only words in the words container ?
    for (let index = this.refs.words.length - 1; index >= 0; index--) {
      this.removeWord(this.refs.words[index], { dispatch: false })
    }
    this.#updateInternalWords()
  }

  beforeDestroy () {
    this.refs.droppable.destroy()
  }
}
