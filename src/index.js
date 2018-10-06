/* globals chrome */

const provider = require('eth-provider')('ws://127.0.0.1:1248')

const subs = {}

const getOrigin = url => {
  let path = url.split('/')
  return path[0] + '//' + path[2]
}

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
  payload.__frameOrigin = getOrigin(sender.url)
  provider.sendAsync(payload, (err, response) => {
    if (err) console.log(err)
    if (response && response.result) {
      if (payload.method === 'eth_subscribe') {
        subs[response.result] = (payload) => chrome.tabs.sendMessage(sender.tab.id, payload)
      } else if (payload.method === 'eth_unsubscribe') {
        payload.params.forEach(sub => { if (subs[sub]) delete subs[sub] })
      }
    }
    sendResponse(response)
  })
  return true
})

provider.on('data', (payload) => {
  if (subs[payload.params.subscription]) subs[payload.params.subscription](payload)
})
