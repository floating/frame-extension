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
    if (payload && payload.method && payload.method === 'eth_requestAccounts') {
      this.emit('payload', { id: payload.id, jsonrpc: payload.jsonrpc, error: 'No eth_requestAccounts' })
    } else {
      window.postMessage({ type: 'eth:send', payload }, window.location.origin)
    }
  }
}

class FrameProvider extends EthereumProvider {}

try {
  window.ethereum = new FrameProvider(new Connection())
  window.ethereum.isFrame = true
  window.ethereum.setMaxListeners(128)
  window.web3 = new Web3(new FrameProvider(new Connection())) // Give Web3 another provider
} catch (e) {
  console.error('Frame Error:', e)
}
