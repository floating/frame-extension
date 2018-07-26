const fs = require('fs')
const path = require('path')
const ncp = require('ncp')

let inject = `
  chrome.runtime.sendMessage({method: 'setActive', active: JSON.parse(localStorage.getItem('__frameActive'))})
  var frame = unescape('${escape(fs.readFileSync(path.join(__dirname, '../dist/frame.js')).toString())}')
  try {
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
copy(['./toggle.js', './manifest.json', './index.js'])
ncp(path.join(__dirname, './icons'), path.join(__dirname, '../dist/icons'))
