// Test that exports works when node runs in native ESM mode

import { strict as assert } from 'node:assert'

import { PreviewSuspense, definePreview } from '@sanity/preview-kit'

// Testing pkg.exports[.]
assert.equal(typeof PreviewSuspense, 'function')
assert.equal(typeof definePreview, 'function')

// Ensure it's possible to check what version of @sanity/preview-kit is being used
import pkg from '@sanity/preview-kit/package.json' assert { type: 'json' }

assert.equal(typeof pkg.version, 'string')
