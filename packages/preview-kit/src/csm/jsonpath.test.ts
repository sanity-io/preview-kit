import { jsonPath } from '@sanity/client/csm'
import { expect, test } from 'vitest'

import { parseJsonPath } from './jsonpath'

test('formats normalised JSON Paths', () => {
  expect(jsonPath(['foo', 'bar', 0, 'baz'])).toBe("$['foo']['bar'][0]['baz']")
})

test('formats normalised JSON Paths with escaped characters', () => {
  expect(jsonPath(['foo', 'bar', 0, 'baz', "it's a 'test'"])).toBe(
    "$['foo']['bar'][0]['baz']['it\\'s a \\'test\\'']",
  )
})

test('parses normalised JSON Paths', () => {
  expect(parseJsonPath("$['foo']['bar'][0]['baz']")).toEqual([
    'foo',
    'bar',
    0,
    'baz',
  ])
})

test('parses normalised JSON Paths with escaped characters', () => {
  expect(
    parseJsonPath("$['foo']['bar'][0]['baz']['it\\'s a \\'test\\'']"),
  ).toEqual(['foo', 'bar', 0, 'baz', "it's a 'test'"])
})

test('parses normalised JSON Paths with key array filter selectors', () => {
  expect(
    parseJsonPath(
      "$['foo'][?(@._key=='section-1')][0]['baz'][?(@._key=='section-2')]",
    ),
  ).toEqual([
    'foo',
    { key: 'section-1', index: -1 },
    0,
    'baz',
    { key: 'section-2', index: -1 },
  ])
})
