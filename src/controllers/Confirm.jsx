import { render } from '@tooooools/ui'
import Confirm from '/components/Confirm'

/**
 * Render a confirmation <Modal> before executing the given action
 * @param  {function} callback
 * @param  {Object} props - <Modal> props
 * @return {Promise} Promise resolved once the action is done
 */
export default async function confirm (callback, props = {}) {
  const confirmed = await new Promise(resolve => {
    render(
      <Confirm event-close={resolve} event-input={resolve} {...props}>
        {(typeof props.message === 'string'
          ? <div innerHTML={props.message} />
          : props.message
        )}
      </Confirm>
    )
  })

  if (confirmed) return callback()
}
