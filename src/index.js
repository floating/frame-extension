/* globals chrome */

const provider = require('eth-provider')('ws://127.0.0.1:1248?identity=frame-extension')

const subs = {}
const pending = {}

const getOrigin = url => {
  let path = url.split('/')
  return path[0] + '//' + path[2]
}

provider.connection.on('payload', payload => {
  if (typeof payload.id !== 'undefined') {
    if (pending[payload.id]) {
      let { tabId, payloadId } = pending[payload.id]
      if (pending[payload.id].method === 'eth_subscribe' && payload.result) {
        subs[payload.result] = subload => chrome.tabs.sendMessage(tabId, subload)
      } else if (pending[payload.id].method === 'eth_unsubscribe') {
        payload.params.forEach(sub => delete subs[sub])
      }
      chrome.tabs.sendMessage(tabId, Object.assign({}, payload, { id: payloadId }))
      delete pending[payload.id]
    }
  } else if (payload.method && payload.method.indexOf('_subscription') > -1 && subs[payload.params.subscription]) { // Emit subscription result to tab
    subs[payload.params.subscription](payload)
  }
})

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
  let id = provider.nextId++
  pending[id] = { tabId: sender.tab.id, payloadId: payload.id, method: payload.method }
  let load = Object.assign({}, payload, { id, __frameOrigin: getOrigin(sender.url) })
  provider.connection.send(load)
})
