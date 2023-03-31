import { expect, test } from 'vitest'

import { normalisedJsonPath, parseNormalisedJsonPath } from './jsonpath'

test('formats normalised JSON Paths', () => {
  expect(normalisedJsonPath(['foo', 'bar', 0, 'baz'])).toBe(
    "$['foo']['bar'][0]['baz']"
  )
})

test('formats normalised JSON Paths with escaped characters', () => {
  expect(normalisedJsonPath(['foo', 'bar', 0, 'baz', "it's a 'test'"])).toBe(
    "$['foo']['bar'][0]['baz']['it\\'s a \\'test\\'']"
  )
})

test('parses normalised JSON Paths', () => {
  expect(parseNormalisedJsonPath("$['foo']['bar'][0]['baz']")).toEqual([
    'foo',
    'bar',
    0,
    'baz',
  ])
})

test('parses normalised JSON Paths with escaped characters', () => {
  expect(
    parseNormalisedJsonPath("$['foo']['bar'][0]['baz']['it\\'s a \\'test\\'']")
  ).toEqual(['foo', 'bar', 0, 'baz', "it's a 'test'"])
})
