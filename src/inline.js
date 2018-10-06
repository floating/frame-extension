const fs = require('fs')
const path = require('path')
const ncp = require('ncp')

let inject = `
  var frame = unescape('${escape(fs.readFileSync(path.join(__dirname, '../dist/frame.js')).toString())}')
  try {
    chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
      window.postMessage({type: 'ethereum:subscription', payload: payload}, window.location.origin)
    })
    window.addEventListener('message', function(event) {
      if (event.source === window && event.data && event.data.type === 'ethereum:send') {
        chrome.runtime.sendMessage(event.data.payload, function (response) {
          window.postMessage({type: 'ethereum:response', payload: response}, window.location.origin)
        })
      }
    })
    let script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.innerText = frame
    script.onload = function () { this.remove() }
    document.head ? document.head.prepend(script) : document.documentElement.prepend(script)
  } catch (e) {
    console.log(e)
  }
`
fs.writeFile(path.join(__dirname, '../dist/inject.js'), inject, err => { if (err) throw err })
let copy = files => files.forEach(file => fs.createReadStream(path.join(__dirname, file)).pipe(fs.createWriteStream(path.join(__dirname, '../dist/', file))))
copy(['./manifest.json'])
ncp(path.join(__dirname, './icons'), path.join(__dirname, '../dist/icons'))
