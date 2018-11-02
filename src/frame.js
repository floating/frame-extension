const EventEmitter = require('events')
const Web3 = require('web3')
const EthereumProvider = require('ethereum-provider')

class Connection extends EventEmitter {
  constructor () {
    super()
    window.addEventListener('message', event => {
      if (event && event.source === window && event.data && event.data.type === 'eth:payload') {
        this.emit('payload', event.data.payload)
      }
    })
    setTimeout(() => this.emit('connect'), 0)
  }
  send (payload) {
    window.postMessage({ type: 'eth:send', payload }, window.location.origin)
  }
}

try {
  window.ethereum = new EthereumProvider(new Connection())
  window.ethereum.setMaxListeners(128)
  window.web3 = new Web3(new EthereumProvider(new Connection())) // Web3 will clobber send so we need another provider
} catch (e) {
  console.error('Frame Error:', e)
}
