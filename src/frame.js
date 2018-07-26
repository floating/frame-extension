/* global localStorage */

const provider = require('eth-provider')

let active = JSON.parse(localStorage.getItem('__frameActive'))

if (active) {
  try {
    const frameProvider = provider('frame')
    window.web3 = {givenProvider: frameProvider, currentProvider: frameProvider}
  } catch (e) {
    console.error('Frame Error:', e)
  }
}
