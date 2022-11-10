// Test that exports works when node runs in CJS mode

const { strict: assert } = require('node:assert')

const previewKit = require('@sanity/preview-kit')
const { PreviewSuspense } = previewKit

// Testing pkg.exports[.]
assert.equal(typeof PreviewSuspense, 'function')

// Ensure it's possible to check what version of @sanity/preview-kity is being used
const pkg = require('@sanity/preview-kit/package.json')

assert.equal(typeof pkg.version, 'string')
