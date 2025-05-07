import './Poster.scss'
import { Component } from '@tooooools/ui'
import { animate, stagger, utils } from 'animejs'

export default class Poster extends Component {
  template (props, state) {
    return (
      <section class='poster' >
        {/* TODO load template */}
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 10rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 2rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 10rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 8rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 3rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 10rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 20rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 10rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 5rem' />
        <div event-click={this.#handleClick} class='cell' ref={this.refArray('cells')} style='font-size: 8rem' />
      </section>
    )
  }

  // WIP cell click instead (w/ preset)
  #handleClick = e => {
    const targets = e.currentTarget.querySelectorAll('.word__char')
    if (!targets || !targets.length) return

    if (e.currentTarget.animation) {
      this.log(e.currentTarget.animation.currentTime)
      e.currentTarget.animation.pause()
      e.currentTarget.animation.seek(e.currentTarget.animation.currentTime).play()
      // delete e.currentTarget.animation
    } else {
      e.currentTarget.animation = animate(targets, {
        y: [target => utils.get(target, 'y'), '100%'],

        // '--wght': { from: 100, to: 800 },
        letterSpacing: [target => utils.get(target, 'letterSpacing', 'px'), '20px'],
        // // color: 'rgba(255, 168, 40, .2)',
        // delay: stagger(65, { from: 'center' }),
        // // filter: 'blur(10px)',
        // ease: 'outElastic',
        // alternate: true,
        // loop: 1,
        ease: 'outElastic',
        duration: 10_000,
        // onUpdate: this.log
      })
    }
  }
}
