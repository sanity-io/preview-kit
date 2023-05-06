// Test that exports works when node runs in CJS mode

const { strict: assert } = require('node:assert')

const previewKit = require('@sanity/preview-kit')
const { useListeningQuery } = previewKit
const previewKitClient = require('@sanity/preview-kit/client')
const { createClient } = previewKitClient
const previewKitGroqStore = require('@sanity/preview-kit/groq-store')
const { GroqStoreProvider } = previewKitGroqStore
const previewKitLiveStore = require('@sanity/preview-kit/live-store')
const { LiveStoreProvider } = previewKitLiveStore

assert.equal(typeof useListeningQuery, 'function')
assert.equal(typeof createClient, 'function')
assert.equal(typeof GroqStoreProvider, 'object')
assert.equal(typeof LiveStoreProvider, 'object')
