const provider = require('eth-provider')
const Web3 = require('web3')

try {
  const frameProvider = provider('frame')
  window.web3 = new Web3(frameProvider)
} catch (e) {
  console.error('Frame Error:', e)
}
