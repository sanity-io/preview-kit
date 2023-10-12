import { ContentSourceMap } from '@sanity/client'
import { expect, test, vi } from 'vitest'

import { encode } from './sourcemap'

const encodeTestCases: {
  name: string
  queryResult: {
    result: unknown
    resultSourceMap: ContentSourceMap
  }
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
]

test.each(encodeTestCases)('encode $name', ({ queryResult, expected }) => {
  const mockTranscoder = vi.fn().mockImplementation((input: string) => input)
  encode(queryResult.result, queryResult.resultSourceMap, mockTranscoder)

  expect(mockTranscoder).toBeCalledTimes(expected.encoderCalls)
  for (const args of expected.encoderArgs) {
    expect(mockTranscoder).toBeCalledWith(...args)
  }
})
