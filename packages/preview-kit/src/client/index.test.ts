/* eslint-disable no-irregular-whitespace */
import { vercelStegaDecode } from '@vercel/stega'
import { expect, test } from 'vitest'

import { createClient } from './index'

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

  const resultArray = await client.fetch(`*[_id == $id]`, {
    id: 'c7fd2fd7-5445-443d-9e80-e11d6c32f47a',
  })
  expect(vercelStegaDecode(resultArray[0].title)).toMatchInlineSnapshot(
    `
    {
      "href": "https://preview-kit-test-studio.sanity.build/intent/edit/id=c7fd2fd7-5445-443d-9e80-e11d6c32f47a;path=title",
      "origin": "sanity.io",
    }
  `
  )

  const resultObject = await client.fetch(`*[_id == $id][0]`, {
    id: 'c7fd2fd7-5445-443d-9e80-e11d6c32f47a',
  })
  expect(vercelStegaDecode(resultObject.title)).toMatchInlineSnapshot(
    `
    {
      "href": "https://preview-kit-test-studio.sanity.build/intent/edit/id=c7fd2fd7-5445-443d-9e80-e11d6c32f47a;path=title",
      "origin": "sanity.io",
    }
  `
  )

  const resultString = await client.fetch(`*[_id == $id][0].title`, {
    id: 'c7fd2fd7-5445-443d-9e80-e11d6c32f47a',
  })
  expect(vercelStegaDecode(resultString)).toMatchInlineSnapshot(`
    {
      "href": "https://preview-kit-test-studio.sanity.build/intent/edit/id=c7fd2fd7-5445-443d-9e80-e11d6c32f47a;path=title",
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
    `*[_id == $id][0].title`,
    {
      id: 'c7fd2fd7-5445-443d-9e80-e11d6c32f47a',
    },
    { filterResponse: false }
  )
  expect(vercelStegaDecode(result)).toMatchInlineSnapshot(`
    {
      "href": "/studio/intent/edit/id=c7fd2fd7-5445-443d-9e80-e11d6c32f47a;path=title",
      "origin": "sanity.io",
    }
  `)
  expect(resultSourceMap).toMatchInlineSnapshot(`
    {
      "documents": [
        {
          "_id": "c7fd2fd7-5445-443d-9e80-e11d6c32f47a",
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
    `*[_id == $id][0].title`,
    {
      id: 'c7fd2fd7-5445-443d-9e80-e11d6c32f47a',
    },
    { filterResponse: false }
  )
  expect(vercelStegaDecode(result)).toBeUndefined()
  expect(resultSourceMap).toMatchInlineSnapshot(`
    {
      "documents": [
        {
          "_id": "c7fd2fd7-5445-443d-9e80-e11d6c32f47a",
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

  const resultString = await client.fetch(`*[_id == $id][0].title`, {
    id: 'c7fd2fd7-5445-443d-9e80-e11d6c32f47a',
  })
  expect(resultString).toBe('🚀 🤯')
  expect(vercelStegaDecode(resultString)).toBe(undefined)
})
