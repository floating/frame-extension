/* globals chrome */

function mmAppearToggle () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { code: 'localStorage[\'__mmAppear\']' }, (results) => {
      let mmAppear = false
      if (results) {
        try {
          mmAppear = JSON.parse(results[0])
        } catch (e) {
          mmAppear = false
        }
      }
      chrome.tabs.executeScript(tabs[0].id, { code: `localStorage.setItem('__mmAppear', ${JSON.stringify(!mmAppear)}); window.location.reload();` })
      window.close()
    })
  })
}

// function summonFrame () {
//   chrome.runtime.sendMessage({ jsonrpc: '2.0', id: 1, method: 'frame_summon', params: [] })
//   window.close()
// }

// const getOrigin = url => {
//   const path = url.split('/')
//   return path[0] + '//' + path[2]
// }

document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({ jsonrpc: '2.0', id: 1, method: 'frame_summon', params: [] })
  document.getElementById('mmAppearToggle').addEventListener('click', mmAppearToggle)
  // document.getElementById('summonFrame').addEventListener('click', summonFrame)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { code: 'localStorage[\'__mmAppear\']' }, (results) => {
      let mmAppear = false
      if (results) {
        try {
          mmAppear = JSON.parse(results[0])
        } catch (e) {
          mmAppear = false
        }
      }
      const toggle = document.getElementById('mmAppearToggle')
      const injecting = document.getElementById('injectingAs')
      if (mmAppear) {
        toggle.className = 'frame'
        toggle.innerHTML = 'Appear As Frame'
        injecting.innerHTML = 'MetaMask'
        injecting.className = 'mm'
      } else {
        toggle.className = 'mm'
        toggle.innerHTML = 'Appear As MetaMask'
        injecting.innerHTML = 'Frame'
        injecting.className = 'frame'
      }
    })
  })
})
