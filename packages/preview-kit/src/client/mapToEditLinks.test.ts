import { expect, test } from 'vitest'

import { mapToEditLinks } from './mapToEditLinks'

const resultEditLinksTestCases = [
  {
    name: 'returns links for all strings in the result',
    queryResult: {
      result: [
        {
          linkMe: 'that',
          deep: [
            {
              linkMe: 'that',
            },
          ],
        },
      ],
      resultSourceMap: {
        documents: [
          {
            _id: 'foo',
          },
        ],
        paths: ["$['linkMe']", "$['deep']"],
        mappings: {
          "$[0]['linkMe']": {
            source: {
              document: 0,
              path: 0,
              type: 'documentValue',
            },
            type: 'value',
          },
          "$[0]['deep']": {
            source: {
              document: 0,
              path: 1,
              type: 'documentValue',
            },
            type: 'value',
          },
        },
      },
    },
    expected: [
      {
        linkMe: 'test.sanity.studio/intent/edit/id=foo;path=linkMe',
        deep: [
          {
            linkMe:
              'test.sanity.studio/intent/edit/id=foo;path=deep%5B0%5D.linkMe',
          },
        ],
      },
    ],
  },
  {
    name: 'results should be unchanged if no compatible types are found',
    queryResult: {
      result: [
        {
          dontLinkMe: 1,
        },
      ],
      resultSourceMap: {
        documents: [
          {
            _id: 'foo',
          },
        ],
        paths: ["$['dontLinkMe']"],
        mappings: {
          "$[0]['dontLinkMe']": {
            source: {
              document: 0,
              path: 0,
              type: 'documentValue',
            },
            type: 'value',
          },
        },
      },
    },
    expected: [
      {
        dontLinkMe: 1,
      },
    ],
  },
]

test.each(resultEditLinksTestCases)(
  'mapToEditLinks $name',
  ({ queryResult, expected }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = mapToEditLinks(queryResult as any, 'test.sanity.studio/')
    expect(response).toEqual(expected)
  }
)
