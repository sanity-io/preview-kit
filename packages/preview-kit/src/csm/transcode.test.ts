/* eslint-disable no-irregular-whitespace */
import type { ContentSourceMap } from '@sanity/client'
import { vercelStegaDecode } from '@vercel/stega'
import { expect, test } from 'vitest'

import { createTranscoder } from './transcode'

const queryResult = {
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a massa sodales, efficitur nunc vitae, aliquam lorem. Nulla et vehicula mauris. Phasellus maximus feugiat turpis, at finibus lorem rhoncus ut. Sed hendrerit ullamcorper odio sit amet imperdiet. Phasellus in felis fringilla, bibendum sem id, vehicula urna. Nulla nisi leo, pretium quis mi malesuada, dictum consectetur nisi. Sed tristique nisi a ipsum efficitur, vitae semper velit sodales. Nulla laoreet tortor non nisl aliquet, et aliquet est interdum. Suspendisse volutpat semper neque, vitae porta turpis vestibulum eget. Aliquam mattis arcu ut eros luctus, vitae consequat turpis tincidunt. In in tempus quam, at euismod nulla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec consectetur non nulla in elementum. Maecenas a sem ex. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Proin cursus pretium vestibulum.',
  number: 0,
  arr: ['foo', 'bar'],
  nested: {
    inner: {
      foo: 'bar',
    },
  },
  slug: '/agency-partners/10up',
}

const csm: ContentSourceMap = {
  documents: [
    {
      _id: '46f04857-2785-493c-bd63-be8fb35a9130',
    },
  ],
  paths: [
    "$['content'][0]['children'][0]['text']",
    "$['number']",
    "$['someArr'][0]",
    "$['someArr'][1]",
    "$['someNestObj']",
    "$['slug']['current']",
  ],
  mappings: {
    "$['text']": {
      source: {
        document: 0,
        path: 0,
        type: 'documentValue',
      },
      type: 'value',
    },
    "$['number']": {
      source: {
        document: 0,
        path: 1,
        type: 'documentValue',
      },
      type: 'value',
    },
    "$['arr'][0]": {
      source: {
        document: 0,
        path: 2,
        type: 'documentValue',
      },
      type: 'value',
    },
    "$['arr'][1]": {
      source: {
        document: 0,
        path: 3,
        type: 'documentValue',
      },
      type: 'value',
    },
    "$['nested']": {
      source: {
        document: 0,
        path: 4,
        type: 'documentValue',
      },
      type: 'value',
    },
    "$['slug']": {
      source: {
        document: 0,
        path: 5,
        type: 'documentValue',
      },
      type: 'value',
    },
  },
}

test('transcoder encodes strings within result with stega using csm', () => {
  const queryResultCopy = JSON.parse(
    JSON.stringify(queryResult),
  ) as typeof queryResult

  const transcoder = createTranscoder(
    'https://admin.sanity.studio',
    undefined,
    console,
  )
  const transcoderResult = transcoder(queryResultCopy, csm)

  expect(transcoderResult.result.text).toContain(queryResultCopy.text)
  expect(transcoderResult.result.arr[0]).toContain(queryResultCopy.arr[0])
  expect(transcoderResult.result.arr[1]).toContain(queryResultCopy.arr[1])
  expect(transcoderResult.result.nested.inner.foo).toContain(
    queryResultCopy.nested.inner.foo,
  )

  expect(vercelStegaDecode(transcoderResult.result.text))
    .toMatchInlineSnapshot(`
    {
      "href": "https://admin.sanity.studio/intent/edit/id=46f04857-2785-493c-bd63-be8fb35a9130;path=content%5B0%5D.children%5B0%5D.text",
      "origin": "sanity.io",
    }
  `)
  expect(vercelStegaDecode(transcoderResult.result.arr[0]))
    .toMatchInlineSnapshot(`
    {
      "href": "https://admin.sanity.studio/intent/edit/id=46f04857-2785-493c-bd63-be8fb35a9130;path=someArr%5B0%5D",
      "origin": "sanity.io",
    }
  `)
  expect(vercelStegaDecode(transcoderResult.result.arr[1]))
    .toMatchInlineSnapshot(`
    {
      "href": "https://admin.sanity.studio/intent/edit/id=46f04857-2785-493c-bd63-be8fb35a9130;path=someArr%5B1%5D",
      "origin": "sanity.io",
    }
  `)
  expect(vercelStegaDecode(transcoderResult.result.nested.inner.foo))
    .toMatchInlineSnapshot(`
    {
      "href": "https://admin.sanity.studio/intent/edit/id=46f04857-2785-493c-bd63-be8fb35a9130;path=someNestObj.inner.foo",
      "origin": "sanity.io",
    }
  `)
})

test('transcoder correctly reports processing', () => {
  const queryResultCopy = JSON.parse(
    JSON.stringify(queryResult),
  ) as typeof queryResult

  const transcoder = createTranscoder(
    'https://admin.sanity.studio',
    undefined,
    console,
  )
  const transcoderResult = transcoder(queryResultCopy, csm)

  expect(transcoderResult.report).toMatchInlineSnapshot(`
    {
      "encoded": [
        {
          "length": 945,
          "path": "content[0].children[0].text",
          "value": "Lorem ipsum dolor si...",
        },
        {
          "length": 3,
          "path": "someArr[0]",
          "value": "foo",
        },
        {
          "length": 3,
          "path": "someArr[1]",
          "value": "bar",
        },
        {
          "length": 3,
          "path": "someNestObj.inner.foo",
          "value": "bar",
        },
      ],
      "skipped": [
        {
          "length": 21,
          "path": "slug.current",
          "value": "/agency-partners/10u...",
        },
      ],
    }
  `)
})
