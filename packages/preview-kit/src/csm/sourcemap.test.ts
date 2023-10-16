import { ContentSourceMap } from '@sanity/client'
import { expect, test, vi } from 'vitest'

import { encode } from './sourcemap'

const encodeTestCases: {
  name: string
  queryResult: {
    result: unknown
    resultSourceMap: ContentSourceMap
  }
  options?: {
    keyArraySelectors: boolean
  },
  expected: {
    encoderCalls: number
    encoderArgs: unknown[][]
  }
}[] = [
  {
    name: 'resolves exact mappings to source',
    queryResult: {
      result: [
        {
          _id: 'foo',
          this: 'that',
        },
      ],
      resultSourceMap: {
        documents: [
          {
            _id: 'foo',
            _type: 'bar',
          },
        ],
        paths: ["$['this']"],
        mappings: {
          "$[0]['this']": {
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
    expected: {
      encoderCalls: 1,
      encoderArgs: [['that', { _id: 'foo', _type: 'bar' }, ['this']]],
    },
  },
  {
    name: 'resolves aggregated mappings to source',
    queryResult: {
      result: [
        {
          _id: 'foo',
          nested: {
            object: {
              this: 'that',
            },
          },
        },
      ],
      resultSourceMap: {
        documents: [
          {
            _id: 'foo',
            _type: 'bar',
          },
        ],
        paths: ["$['something']['nested']"],
        mappings: {
          "$[0]['nested']": {
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
    expected: {
      encoderCalls: 1,
      encoderArgs: [
        [
          'that',
          { _id: 'foo', _type: 'bar' },
          ['something', 'nested', 'object', 'this'],
        ],
      ],
    },
  },
  {
    name: 'plucks out _key to use as path segment',
    queryResult: {
      result: [
        {
          _id: 'foo',
          nested: {
            arr: [
              {
                _key: 'im_a_key',
                value: 'that',
              },
            ]
          },
        },
      ],
      resultSourceMap: {
        documents: [
          {
            _id: 'foo',
            _type: 'bar',
          },
        ],
        paths: ["$['projected']['nested']"],
        mappings: {
          "$[0]['nested']": {
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
    options: {
      keyArraySelectors: true,
    },
    expected: {
      encoderCalls: 2,
      encoderArgs: [
        [
          'im_a_key',
          { _id: 'foo', _type: 'bar' },
          ['projected', 'nested', 'arr', { key: 'im_a_key', index: 0 }, '_key']
        ],
        [
          'that',
          { _id: 'foo', _type: 'bar' },
          ['projected', 'nested', 'arr', { key: 'im_a_key', index: 0 }, 'value']
        ],
      ],
    },
  },
  {
    name: 'handles _key array filter selectors in source paths',
    queryResult: {
      result: [
        {
          _id: 'foo',
          arr: [
            {
              _key: 'im_a_key',
              value: 'that',
            },
          ]
        },
      ],
      resultSourceMap: {
        documents: [
          {
            _id: 'foo',
            _type: 'bar',
          },
        ],
        paths: ["$['projected'][?(@._key=='fooKey')]"],
        mappings: {
          "$[0]['arr']": {
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
    options: {
      keyArraySelectors: true,
    },
    expected: {
      encoderCalls: 2,
      encoderArgs: [
        [
          'im_a_key',
          { _id: 'foo', _type: 'bar' },
          ['projected', { key: 'fooKey', index: -1 }, { key: 'im_a_key', index: 0 }, '_key']
        ],
        [
          'that',
          { _id: 'foo', _type: 'bar' },
          ['projected', { key: 'fooKey', index: -1 }, { key: 'im_a_key', index: 0 }, 'value']
        ],
      ],
    },
  },
]

test.each(encodeTestCases)('encode $name', ({ queryResult, options, expected }) => {
  const mockTranscoder = vi.fn().mockImplementation((input: string) => input)
  encode(queryResult.result, queryResult.resultSourceMap, mockTranscoder, options)

  expect(mockTranscoder).toBeCalledTimes(expected.encoderCalls)
  for (const args of expected.encoderArgs) {
    expect(mockTranscoder).toBeCalledWith(...args)
  }
})
