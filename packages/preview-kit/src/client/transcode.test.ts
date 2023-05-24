/* eslint-disable no-irregular-whitespace */
import { vercelStegaDecode } from '@vercel/stega'
import { expect, test } from 'vitest'

import { createTranscoder } from './transcode'

test('transcodes Content Lake source mappings to Vercel stega encoded metadata', () => {
  const { transcode, report } = createTranscoder(
    'https://admin.sanity.studio',
    undefined,
    console
  )
  const ptString =
    '​Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a massa sodales, efficitur nunc vitae, aliquam lorem. Nulla et vehicula mauris. Phasellus maximus feugiat turpis, at finibus lorem rhoncus ut. Sed hendrerit ullamcorper odio sit amet imperdiet. Phasellus in felis fringilla, bibendum sem id, vehicula urna. Nulla nisi leo, pretium quis mi malesuada, dictum consectetur nisi. Sed tristique nisi a ipsum efficitur, vitae semper velit sodales. Nulla laoreet tortor non nisl aliquet, et aliquet est interdum. Suspendisse volutpat semper neque, vitae porta turpis vestibulum eget. Aliquam mattis arcu ut eros luctus, vitae consequat turpis tincidunt. In in tempus quam, at euismod nulla. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec consectetur non nulla in elementum. Maecenas a sem ex. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Proin cursus pretium vestibulum.'

  const result = transcode(
    ptString,
    {
      _projectId: '',
      _dataset: '',
      _id: '46f04857-2785-493c-bd63-be8fb35a9130',
    },
    ['content', 0, 'children', 0, 'text']
  )

  expect(result).toContain(ptString)
  expect(vercelStegaDecode(result)).toMatchInlineSnapshot(`
    {
      "href": "https://admin.sanity.studio/intent/edit/id=46f04857-2785-493c-bd63-be8fb35a9130;path=content%5B0%5D.children%5B0%5D.text",
      "origin": "sanity.io",
    }
  `)
  expect(report).toMatchInlineSnapshot(`
    {
      "encoded": [
        {
          "length": 946,
          "path": "content[0].children[0].text",
          "value": "​Lorem ipsum dolor s...",
        },
      ],
      "skipped": [],
    }
  `)
})

test('always skips slugs', () => {
  const { transcode, report } = createTranscoder('/', undefined, console)
  const result = transcode(
    '/agency-partners/10up',
    {
      _projectId: '',
      _dataset: '',
      _id: '46f04857-2785-493c-bd63-be8fb35a9130',
    },
    ['slug', 'current']
  )
  expect(result).toBe('/agency-partners/10up')
  expect(vercelStegaDecode(result)).toMatchInlineSnapshot('undefined')
  expect(report).toMatchInlineSnapshot(`
    {
      "encoded": [],
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
