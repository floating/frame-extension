const EventEmitter = require('events')

try {
  class EthereumProvider extends EventEmitter {
    constructor () {
      super()
      this.handlers = {}
      window.addEventListener('message', event => {
        if (event.source === window && event.data && event.data.type === 'ethereum:response') {
          let payload = event.data.payload
          if (this.handlers[payload.id]) this.handlers[payload.id](payload.error ? new Error(payload.error) : null, payload)
        }
      })
    }
    enable () {
      return new Promise()
    }
    sendAsync (payload, cb) {
      this.handlers[payload.id] = cb
      window.postMessage({type: 'ethereum:send', payload}, window.location.origin)
    }
  }
  window.ethereum = new EthereumProvider()
} catch (e) {
  console.error('Frame Error:', e)
}
