/* eslint-disable no-irregular-whitespace */
import { vercelStegaDecode } from '@vercel/stega'
import { expect, test } from 'vitest'

import { createClient } from './createClient'

const title = '🚀 🤯'

test('it returns stega encoded source maps', async () => {
  expect.assertions(3)
  const client = createClient({
    studioUrl: 'https://preview-kit-test-studio.sanity.build/',
    encodeSourceMap: true,
    projectId: 'pv8y60vp',
    dataset: 'production',
    apiVersion: '2023-05-03',
    logger: console,
  })

  const resultArray = await client.fetch(
    `*[_type == "page" && title == $title][0..1]`,
    { title }
  )
  expect(vercelStegaDecode(resultArray[0].title)).toMatchInlineSnapshot(
    `
    {
      "href": "https://preview-kit-test-studio.sanity.build/intent/edit/id=abbba612-5449-42fc-b3f4-f4ec8a98c6ee;path=title",
      "origin": "sanity.io",
    }
  `
  )

  const resultObject = await client.fetch(
    `*[_type == "page" && title == $title][0]`,
    { title }
  )
  expect(vercelStegaDecode(resultObject.title)).toMatchInlineSnapshot(
    `
    {
      "href": "https://preview-kit-test-studio.sanity.build/intent/edit/id=abbba612-5449-42fc-b3f4-f4ec8a98c6ee;path=title",
      "origin": "sanity.io",
    }
  `
  )

  const resultString = await client.fetch(
    `*[_type == "page" && title == $title][0].title`,
    { title }
  )
  expect(vercelStegaDecode(resultString)).toMatchInlineSnapshot(`
    {
      "href": "https://preview-kit-test-studio.sanity.build/intent/edit/id=abbba612-5449-42fc-b3f4-f4ec8a98c6ee;path=title",
      "origin": "sanity.io",
    }
  `)
})

test('it can access the original source map', async () => {
  expect.assertions(2)
  const client = createClient({
    studioUrl: '/studio',
    encodeSourceMap: true,
    projectId: 'pv8y60vp',
    dataset: 'production',
    apiVersion: '2023-05-03',
  })

  const { result, resultSourceMap } = await client.fetch(
    `*[_type == "page" && title == $title][0].title`,
    { title },
    { filterResponse: false }
  )
  expect(vercelStegaDecode(result)).toMatchInlineSnapshot(`
    {
      "href": "/studio/intent/edit/id=abbba612-5449-42fc-b3f4-f4ec8a98c6ee;path=title",
      "origin": "sanity.io",
    }
  `)
  expect(resultSourceMap).toMatchInlineSnapshot(`
    {
      "documents": [
        {
          "_id": "abbba612-5449-42fc-b3f4-f4ec8a98c6ee",
        },
      ],
      "mappings": {
        "$": {
          "source": {
            "document": 0,
            "path": 0,
            "type": "documentValue",
          },
          "type": "value",
        },
      },
      "paths": [
        "$['title']",
      ],
    }
  `)
})

test('it can query the content source map without transcoding', async () => {
  expect.assertions(2)
  const client = createClient({
    studioUrl: '/studio',
    encodeSourceMap: false,
    resultSourceMap: true,
    apiVersion: '2023-05-03',
    projectId: 'pv8y60vp',
    dataset: 'production',
  })

  const { result, resultSourceMap } = await client.fetch(
    `*[_type == "page" && title == $title][0].title`,
    { title },
    { filterResponse: false }
  )
  expect(vercelStegaDecode(result)).toBeUndefined()
  expect(resultSourceMap).toMatchInlineSnapshot(`
    {
      "documents": [
        {
          "_id": "abbba612-5449-42fc-b3f4-f4ec8a98c6ee",
        },
      ],
      "mappings": {
        "$": {
          "source": {
            "document": 0,
            "path": 0,
            "type": "documentValue",
          },
          "type": "value",
        },
      },
      "paths": [
        "$['title']",
      ],
    }
  `)
})

test('encodeSourceMapAtPath', async () => {
  expect.assertions(2)
  const client = createClient({
    studioUrl: 'https://preview-kit-test-studio.sanity.build/',
    encodeSourceMap: true,
    projectId: 'pv8y60vp',
    dataset: 'production',
    useCdn: true,
    encodeSourceMapAtPath: ({ path }) => path.at(-1) !== 'title',
  })

  const resultString = await client.fetch(
    `*[_type == "page" && title == $title][0].title`,
    { title }
  )
  expect(resultString).toBe('🚀 🤯')
  expect(vercelStegaDecode(resultString)).toBe(undefined)
})
