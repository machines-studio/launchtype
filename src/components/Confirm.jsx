import './Confirm.scss'
import { Component } from '@tooooools/ui'

import * as Icons from '/data/icons'

import noop from '/utils/noop'

import {
  Button,
  Modal,
  Toolbar
} from '@tooooools/ui/components'

export default class ConfirmModalComponent extends Component {
  beforeRender () {
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  template (props, state) {
    return (
      <Modal
        locked={props.locked}
        title={props.title ?? 'Confirmer l’action'}
        class='confirm-modal'
        event-close={() => (props['event-close'] ?? noop)(null, this)}
      >
        <div class='confirm-modal__content'>
          {props.children}
        </div>

        <Toolbar class='confirm-modal__toolbar'>
          <Button
            icon={props.cancel?.icon ?? Icons.close}
            label={props.cancel?.label ?? 'annuler'}
            event-click={this.handleCancel}
          />
          <Button
            active
            icon={props.confirm?.icon ?? Icons.ok}
            label={props.confirm?.label ?? 'valider'}
            event-click={this.handleConfirm}
          />
        </Toolbar>
      </Modal>
    )
  }

  handleConfirm () {
    ;(this.props['event-input'] ?? noop)(true, this)
    this.destroy()
  }

  handleCancel () {
    ;(this.props['event-input'] ?? noop)(false, this)
    this.destroy()
  }
}
