/* globals chrome */

function mmAppearToggle () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.executeScript(tabs[0].id, { code: 'localStorage[\'__frameAppearAsMM__\']' }, (results) => {
        let mmAppear = false
        if (results) {
          try {
            mmAppear = JSON.parse(results[0])
          } catch (e) {
            mmAppear = false
          }
          chrome.tabs.executeScript(tabs[0].id, { code: `localStorage.setItem('__frameAppearAsMM__', ${JSON.stringify(!mmAppear)}); window.location.reload();` })
        }
        window.close()
      })
    }
  })
}

// function summonFrame () {
//   chrome.runtime.sendMessage({ jsonrpc: '2.0', id: 1, method: 'frame_summon', params: [] })
//   window.close()
// }

const getOrigin = url => {
  const path = url.split('/')
  return path[0] + '//' + path[2]
}

// document.getElementById('summonFrame').addEventListener('click', summonFrame)

document.addEventListener('DOMContentLoaded', function () {
  // chrome.runtime.sendMessage({ jsonrpc: '2.0', id: 1, method: 'frame_summon', params: [] })
  document.getElementById('mmAppearToggle').addEventListener('click', mmAppearToggle)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { code: 'localStorage[\'__frameAppearAsMM__\']' }, (results) => {
      let mmAppear = false
      if (results) {
        try {
          mmAppear = JSON.parse(results[0])
        } catch (e) {
          mmAppear = false
        }
      }
      const toggle = document.getElementById('mmAppearToggle')
      const injecting = document.getElementById('mmAppearDescription')
      const sub = document.getElementById('mmAppearSub')
      if (mmAppear) {
        toggle.innerHTML = `<span>Appear As <span class='frame'> Frame </span> Instead </span>`
        injecting.innerHTML = `<span>Injecting as <span class='mm'>Metamask</span> </span>`
      } else {
        toggle.innerHTML = `<span>Appear As <span class='mm'>MetaMask</span> Instead </span>`
        injecting.innerHTML = `<span>Injecting as <span class='frame'>Frame</span> </span>`
      }
      sub.innerHTML = `${getOrigin(tabs[0].url)}`
    })
  })
})
