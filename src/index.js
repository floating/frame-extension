/* globals chrome */

const provider = require('eth-provider')('ws://127.0.0.1:1248')

const getOrigin = url => {
  let path = url.split('/')
  return path[0] + '//' + path[2]
}

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
  payload.__frameOrigin = getOrigin(sender.url)
  provider.sendAsync(payload, (err, res) => { if (!err) sendResponse(res) })
  return true
})
