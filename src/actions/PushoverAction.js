import axios from 'axios'

class PushoverAction {
  constructor(config) {
    this.config = config
    this.notificationSent = false

    if (!config.user_key || !config.app_key) {
      throw new Error('PushoverAction: missing "user_key" and/or "app_key" config options')
    }

    if (config.when === 'param-missing' && !config.param) {
      throw new Error('PushoverAction: missing "param" config option')
    }

    if (config.when !== 'param-missing') {
      throw new Error('PushoverAction: Invalid value for config option "when"')
    }
  }

  boot() {}

  update({ data }) {
    if (this.config.when === 'param-missing') {
      this.checkParamMissing(this.config.param, data)
    }
  }

  checkParamMissing(param, data) {
    if (!Object.keys(data).includes(param)) {
      if (this.notificationSent) {
        return
      }

      const params = {
        token: this.config.app_key,
        user: this.config.user_key,
        message: this.config.message ?? `Der Powerrouter liefert keinen Wert für "${param}".`,
      }
      if (this.config.device) {
        params.device = this.config.device
      }

      axios.post('https://api.pushover.net/1/messages.json', null, { params })
        .then(() => {
          this.notificationSent = true
        })
        .catch((err) => {
          console.error('PushoverAction: Could not send pushover notification', err)
        })
    } else {
      this.notificationSent = false
    }
  }
}

export default PushoverAction
