import { expect, test } from 'vitest'

import * as pkg from './index'

test('exports match', () => {
  expect(pkg).toMatchInlineSnapshot(`
    {
      "createTranscoder": [Function],
      "encodeJsonPathToUriComponent": [Function],
      "jsonPath": [Function],
      "mapToEditLinks": [Function],
      "parseNormalisedJsonPath": [Function],
      "resolveMapping": [Function],
      "walkMap": [Function],
    }
  `)
})

test('backwards compatibility is preserved', () => {
  expect(Object.keys(pkg).sort()).toEqual(
    expect.arrayContaining(
      [
        'createTranscoder',
        'encodeJsonPathToUriComponent',
        'mapToEditLinks',
        'parseNormalisedJsonPath',
        'resolveMapping',
        'walkMap',
      ].sort(),
    ),
  )
})
