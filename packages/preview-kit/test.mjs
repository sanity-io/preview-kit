// Test that exports works when node runs in native ESM mode

import { strict as assert } from 'node:assert'

import { LiveQueryProvider, useLiveQuery } from '@sanity/preview-kit'
import { createClient } from '@sanity/preview-kit/client'

assert.equal(typeof LiveQueryProvider, 'function')
assert.equal(typeof useLiveQuery, 'function')
assert.equal(typeof createClient, 'function')
