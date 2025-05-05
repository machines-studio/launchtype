import './Nut.scss'

import { Component } from '@tooooools/ui'
import rawPublicSvgAsset from '/favicons/icon.svg?raw'

export default class Nut extends Component {
  template (props) {
    return <section class='nut' innerHTML={rawPublicSvgAsset} />
  }

  afterRender () {
    this.base.style.setProperty('--speed', this.props.speed.current)
    this.props.speed.subscribe(speed => {
      this.base.style.setProperty('--speed', speed)
    })
  }
}
