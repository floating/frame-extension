const fs = require('fs')
const path = require('path')
const ncp = require('ncp')

const inject = `
  var frame = unescape('${escape(fs.readFileSync(path.join(__dirname, '../dist/frame.js')).toString())}')
  try {
    chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => window.postMessage({type: 'eth:payload', payload: payload}, window.location.origin))
    window.addEventListener('message', event => {
      if (event.source === window && event.data && event.data.type === 'eth:send') chrome.runtime.sendMessage(event.data.payload)
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
const copy = files => files.forEach(file => fs.createReadStream(path.join(__dirname, file)).pipe(fs.createWriteStream(path.join(__dirname, '../dist/', file))))
copy(['./manifest.json'])
ncp(path.join(__dirname, './icons'), path.join(__dirname, '../dist/icons'))
