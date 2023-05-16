import { expect, test, vi } from 'vitest'

import { encode } from './sourcemap'

const encodeTestCases = [
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
      encoderArgs: [['that', { _id: 'foo' }, `$['this']`]],
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
        ['that', { _id: 'foo' }, `$['something']['nested']['object']['this']`],
      ],
    },
  },
]

test.each(encodeTestCases)('encode $name', ({ queryResult, expected }) => {
  const mockTranscoder = vi.fn().mockImplementation((input: string) => input)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encode(queryResult as any, mockTranscoder)

  expect(mockTranscoder).toBeCalledTimes(expected.encoderCalls)
  for (const args of expected.encoderArgs) {
    expect(mockTranscoder).toBeCalledWith(...args)
  }
})
