/* globals chrome */

function mmAppearToggle () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { code: 'localStorage[\'__mmAppear\']' }, (results) => {
      let mmAppear = results[0]
      try {
        mmAppear = JSON.parse(mmAppear)
      } catch (e) {
        mmAppear = false
      }
      chrome.tabs.executeScript(tabs[0].id, { code: `localStorage.setItem('__mmAppear', ${JSON.stringify(!mmAppear)}); window.location.reload();` })
      window.close()
    })
  })
}

const getOrigin = url => {
  const path = url.split('/')
  return path[0] + '//' + path[2]
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('mmAppearToggle').addEventListener('click', mmAppearToggle)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { code: 'localStorage[\'__mmAppear\']' }, (results) => {
      const origin = getOrigin(tabs[0].url)
      let mmAppear = results[0]
      try {
        mmAppear = JSON.parse(mmAppear)
      } catch (e) {
        mmAppear = false
      }
      document.getElementById('mmAppearDescription').innerHTML = 'Appear as MetaMask for ' + origin + '?' + ' ' + (mmAppear ? 'YES' : 'NO')
      document.getElementById('mmAppearToggle').innerHTML = 'Turn ' + (mmAppear ? 'Off' : 'On')
    })
  })
})
