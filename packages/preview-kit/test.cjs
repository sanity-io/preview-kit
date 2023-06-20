// Test that exports works when node runs in CJS mode

const { strict: assert } = require('node:assert')

const previewKit = require('@sanity/preview-kit')
const {
  LiveQueryProvider,
  useListeningQuery,
  useListeningQueryStatus,
  useLiveQuery,
} = previewKit
const previewKitClient = require('@sanity/preview-kit/client')
const { createClient } = previewKitClient
const previewKitGroqStore = require('@sanity/preview-kit/groq-store')
const { GroqStoreProvider } = previewKitGroqStore

assert.equal(typeof LiveQueryProvider, 'object')
assert.equal(typeof useListeningQuery, 'function')
assert.equal(typeof useListeningQueryStatus, 'function')
assert.equal(typeof useLiveQuery, 'function')
assert.equal(typeof createClient, 'function')
assert.equal(typeof GroqStoreProvider, 'object')
