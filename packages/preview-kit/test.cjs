// Test that exports works when node runs in CJS mode

const { strict: assert } = require('node:assert')

const previewKit = require('@sanity/preview-kit')
const { LiveQueryProvider, useLiveQuery } = previewKit
const previewKitClient = require('@sanity/preview-kit/client')
const { createClient } = previewKitClient

assert.equal(typeof LiveQueryProvider, 'function')
assert.equal(typeof useLiveQuery, 'function')
assert.equal(typeof createClient, 'function')
