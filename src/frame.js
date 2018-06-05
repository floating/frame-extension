/* global localStorage */

const Web3 = require('web3')
const ethProvider = require('eth-provider')

let active = JSON.parse(localStorage.getItem('__frameActive'))

if (active) {
  try {
    let provider = ethProvider()
    window.web3 = new Web3(provider)
    provider.socket.addEventListener('open', () => {
      window.web3.eth.getAccounts((err, accounts) => {
        if (err) return console.error(err)
        window.web3.eth.accounts = accounts
        window.web3.eth.coinbase = accounts[0]
      })
    })
  } catch (e) {
    console.error('Frame Error:', e)
  }
}
