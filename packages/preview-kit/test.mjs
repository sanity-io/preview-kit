// Test that exports works when node runs in native ESM mode

import { strict as assert } from 'node:assert'

import { useListeningQuery } from '@sanity/preview-kit'
import { createClient } from '@sanity/preview-kit/client'
import { GroqStoreProvider } from '@sanity/preview-kit/groq-store'
import { LiveStoreProvider } from '@sanity/preview-kit/live-store'

assert.equal(typeof useListeningQuery, 'function')
assert.equal(typeof createClient, 'function')
assert.equal(typeof GroqStoreProvider, 'object')
assert.equal(typeof LiveStoreProvider, 'object')
