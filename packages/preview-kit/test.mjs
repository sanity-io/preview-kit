// Test that exports works when node runs in native ESM mode

import { strict as assert } from 'node:assert'

import {
  LiveQueryProvider,
  useListeningQuery,
  useListeningQueryStatus,
  useLiveQuery,
} from '@sanity/preview-kit'
import { createClient } from '@sanity/preview-kit/client'

assert.equal(typeof LiveQueryProvider, 'function')
assert.equal(typeof useListeningQuery, 'function')
assert.equal(typeof useListeningQueryStatus, 'function')
assert.equal(typeof useLiveQuery, 'function')
assert.equal(typeof createClient, 'function')
