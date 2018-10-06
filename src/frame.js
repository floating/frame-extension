const EventEmitter = require('events')
const Web3 = require('web3')

try {
  class EthereumProvider extends EventEmitter {
    constructor () {
      super()
      this.handlers = {}
      window.addEventListener('message', event => {
        if (event.source === window && event.data) {
          if (event.data.type === 'ethereum:response') {
            let payload = event.data.payload
            if (this.handlers[payload.id]) this.handlers[payload.id](payload.error ? payload.error : null, payload)
          } else if (event.data.type === 'ethereum:subscription') {
            this.emit('data', event.data.payload)
          }
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
  window.web3 = new Web3(window.ethereum)
} catch (e) {
  console.error('Frame Error:', e)
}
