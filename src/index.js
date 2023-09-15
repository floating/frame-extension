/* globals chrome */

const ethProvider = require('eth-provider')
const { keccak256 } = require('ethereum-cryptography/keccak.js');
const provider = ethProvider('ws://127.0.0.1:1248?identity=frame-extension')
import { decode } from "@ensdomains/content-hash";

// const uint8ArrayFromString = Uint8arrays.fromString;
const subs = {}
const pending = {}

const getOrigin = url => {
  const path = url.split('/')
  return path[0] + '//' + path[2]
}

const pop = show => {
  if (show) {
    chrome.browserAction.setPopup({ popup: 'pop.html' })
  } else {
    chrome.browserAction.setPopup({ popup: 'settings.html' })
  }
}

pop(true)
provider.on('connect', () => pop(false))
provider.on('disconnect', () => pop(true))

provider.connection.on('payload', payload => {
  if (typeof payload.id !== 'undefined') {
    if (pending[payload.id]) {
      const { tabId, payloadId } = pending[payload.id]
      if (pending[payload.id].method === 'eth_subscribe' && payload.result) {
        subs[payload.result] = { tabId, send: subload => chrome.tabs.sendMessage(tabId, subload) }
      } else if (pending[payload.id].method === 'eth_unsubscribe') {
        const params = payload.params ? [].concat(payload.params) : []
        params.forEach(sub => delete subs[sub])
      }
      chrome.tabs.sendMessage(tabId, Object.assign({}, payload, { id: payloadId }))
      delete pending[payload.id]
    }
  } else if (payload.method && payload.method.indexOf('_subscription') > -1 && subs[payload.params.subscription]) { // Emit subscription result to tab
    subs[payload.params.subscription].send(payload)
  }
})

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
  if (payload.method === 'frame_summon') return provider.connection.send(payload)
  const id = provider.nextId++
  pending[id] = { tabId: sender.tab.id, payloadId: payload.id, method: payload.method }
  const load = Object.assign({}, payload, { id, __frameOrigin: getOrigin(sender.url) })
  provider.connection.send(load)
})

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function namehash(name) {
  let node = new Uint8Array(32); // Initialize with 32 zero bytes representing the hash of the empty name

  if (name !== '') {
    const labels = name.split('.').reverse(); // Split the name into its labels and reverse them
    for (const label of labels) {
      const textEncoder = new TextEncoder();
      const labelBuffer = textEncoder.encode(label);
      const labelHash = keccak256(labelBuffer);

      const combinedBuffer = new Uint8Array([...node, ...labelHash]);
      node = keccak256(combinedBuffer);
    }
  }
  
  return '0x' + toHexString(node);
}

function getFunctionSelector(functionSignature) {
  const hash = keccak256(new TextEncoder().encode(functionSignature));
  return Array.from(hash.slice(0, 4)).map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

function getResolverPayload(ensNameHash) {
  const functionSignature = "resolver(bytes32)";
  const functionSelector = getFunctionSelector(functionSignature);

  // Remove '0x' from ensNameHash and pad it to 32 bytes
  const paddedNameHash = ensNameHash.slice(2).padStart(64, '0');

  // Prepare the data payload
  const data = `0x${functionSelector}${paddedNameHash}`;

  return data;
}
const ensRegistryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

async function getENSResolver(provider, ensNameHash) {
  const data = getResolverPayload(ensNameHash);
  const id = provider.nextId++
  
  const payload = {
    jsonrpc: '2.0',
    id,
    method: 'eth_call',
    params: [{
      to: ensRegistryAddress,  // The address of the ENS Registry contract
      data: data
    }, 'latest']
  };

  const result = await provider.send(payload);

  // The result is a 32-byte hex string where the last 20 bytes are the address
  const resolverAddress = '0x' + result.slice(-40);

  return resolverAddress;
}

function getContenthashPayload(ensNameHash) {
  const functionSignature = "contenthash(bytes32)";
  const functionSelector = getFunctionSelector(functionSignature);

  // Remove '0x' from ensNameHash and pad it to 32 bytes
  // const paddedNameHash = ensNameHash.slice(2).padStart(64, '0');

  // Prepare the data payload
  const data = `0x${functionSelector}${ensNameHash.slice(2)}`;

  return data;
}

async function getENSContentHash(provider, ensNameHash, ensResolverAddress) {
  const data = getContenthashPayload(ensNameHash);
  const id = provider.nextId++

  const payload = {
    jsonrpc: '2.0',
    id,
    method: 'eth_call',
    params: [{
      to: ensResolverAddress, // The address of the ENS resolver contract
      data
    }, 'latest']
  };

  const result = await provider.send(payload);

  // Decode the result here (depends on how the ENS resolver encodes the content hash)

  return result;
}

// TODO: propertly extract contenthash from padded contenthash
function decodeHash(hash) {
  const length = parseInt(hash.slice(128, 130), 16) * 2;
  return decode(hash.slice(130, 130 + length));
}

// Resolve ENS domains (e.g. vitalik.eth) to the URL record, otherwise a contenthash record if it exists
chrome.webRequest.onBeforeRequest.addListener(
  async details => {
    const url = new URL(details.url);
    if (url.hostname.endsWith('.eth')) {
      const ensName = url.hostname;
      const ensNameHash = namehash(ensName);
      const resolverAddress = await getENSResolver(provider, ensNameHash);
      
      const contentHash = await getENSContentHash(provider, ensNameHash, resolverAddress);
      const decodedContentHash = decodeHash(contentHash);
      const redirectUrl = `https://${decodedContentHash}.ipfs.dweb.link/${url.pathname}${url.search}`;

      return chrome.tabs.update(details.tabId, { url: redirectUrl })
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

const unsubscribeTab = tabId => {
  Object.keys(pending).forEach(id => { if (pending[id].tabId === tabId) delete pending[id] })
  Object.keys(subs).forEach(sub => {
    if (subs[sub].tabId === tabId) {
      provider.send({ jsonrpc: '2.0', id: 1, method: 'eth_unsubscribe', params: [sub] })
      delete subs[sub]
    }
  })
}

chrome.tabs.onRemoved.addListener((tabId, removed) => unsubscribeTab(tabId))
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { if (changeInfo.url) unsubscribeTab(tabId) })
