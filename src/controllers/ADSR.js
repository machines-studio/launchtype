import { animate, utils } from 'animejs'

/*
           ╱|╲
          ╱ | ╲
         ╱  |  ·─────·
        ╱   |  |     |╲
       ╱    |  |     | ╲
······|     |  |     |  ······
      |     |  |     |
      A     D  S     R
*/

// Map some defaults value that are not correctly interpolated by animejs
const DEFAULTS = {
  // property: { defaultValue: defaultNumericValue }
  letterSpacing: { normal: 0 }
}

export default function ({
  attack = { duration: 1000, ease: 'linear' },
  decay = null,
  sustain = {},
  release = null,
  initialValues = {},
  ...interpolations
}) {
  return {
    // Attach the ADSR envelope to an element
    attach,

    // Detach the ADSR envelope from an element
    detach: element => {
      if (!element.adsr) return
      element.adsr.destroy()
    },

    // Start the ADSR envelope
    start: async (element, targets = [element], { refresh = false } = {}) => {
      // Attach if not already attached
      if (!element.adsr) attach(element)
      if (typeof targets === 'string') targets = element.querySelectorAll(targets)

      element.adsr.cancel()
      element.adsr.prepare(targets, { force: refresh })

      await element.adsr.attack(targets)
      await element.adsr.decay(targets)
      await element.adsr.sustain(targets)
    },

    // Stop the ADSR envelope
    stop: async (element, targets = [element]) => {
      if (!element.adsr) return
      if (typeof targets === 'string') targets = element.querySelectorAll(targets)

      element.adsr.cancel()
      await element.adsr.release(targets)
    }
  }

  /**
   * Attach an ADSR object to a HTMLElement containing all method used for animation
   * @param {HTMLElement} element
   */
  function attach (element) {
    /**
     * Register an animation
     * @param {string} name
     * @param {JSAnimation} animation
     * @return {JSAnimation}
     */
    const register = (name, animation) => {
      element.adsr.animations[name]?.cancel()
      element.adsr.animations[name] = animation
      return animation
    }

    /**
     * Prepare a valid animejs interpolation object
     * @param {(function|number)} from - a function returning a animejs value, or the index in the corresponding user interpolation
     * @param {(function|number)} to - a function returning a animejs value, or the index in the corresponding user interpolation
     * @return {Object} A valid animejs {from, to} tween value
     */
    const tween = (from, to) => Object.entries(interpolations)
      .reduce((acc, [property, values]) => ({
        ...acc,
        [property]: {
          from: typeof from === 'function' ? from(property) : values[from],
          to: typeof to === 'function' ? to(property) : values[to]
        }
      }), {})

    // Return the current value for a given property for a given target
    const current = property => target => utils.get(target, property)
    // Return the initial value for a given property for a given target
    const initial = property => target => target.__adsr_initial?.[property] ?? 0

    // Attach the ADSR object
    element.adsr = {
      animations: {},

      // Prepare targets by storing their initial interpolable values
      prepare: (targets, { force = false } = {}) => {
        for (const element of targets) {
          // Do not refresh initial values unless {force: true}
          if (!force && element.__adsr_initial) continue

          element.__adsr_initial = {}
          for (const property in interpolations) {
            const value = utils.get(element, property)
            element.__adsr_initial[property] = DEFAULTS[property]?.[value] ?? value
          }
        }
      },

      // Register and run a ADSR animation
      attack: targets => attack && register('attack', animate(targets, { ...tween(current, 0), ...attack })),
      decay: targets => decay && register('decay', animate(targets, { ...tween(0, 1), ...decay })),
      sustain: targets => sustain && register('sustain', animate(targets, { loop: true, ...sustain })),
      release: targets => release && register('release', animate(targets, { ...tween(current, initial), ...release })),

      // Cancel all animations, or by specifying their registration name
      cancel: (animations = Object.keys(element.adsr.animations)) => {
        for (const name of animations) element.adsr.animations[name]?.cancel()
      },

      // Destroy all animation, free-up memory and revert to initial state
      destroy: ({ cleanInlineStyles = true } = {}) => {
        if (!element.adsr) return

        // Cancel all registered animations
        for (const animation of Object.values(element.adsr.animations)) {
          animation.cancel()
          // Cleanup all targets
          for (const element of animation.targets) {
            if (!element.__adsr_initial) continue // Skip already cleaned
            // Revert to initial values
            utils.set(element, element.__adsr_initial)
            // Opt-out inline style cleaning (utils.cleanInlineStyles() caused issue with parallel animations)
            if (cleanInlineStyles) element.removeAttribute('style')
            // Ensure element will be skipped in the next cleaning iteration
            delete element.__adsr_initial
          }
        }

        // Detach ADSR instance
        delete element.adsr
      }
    }

    return element
  }
}
