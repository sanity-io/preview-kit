import { describe, expect, test } from 'vitest'

describe('exports[./live-query]', () => {
  test('should have the same exports on the react-server condition as the src', async () => {
    expect.hasAssertions()
    const src = await import('./live-query')
    const reactServer = await import('../../react-server/live-query')
    expect(Object.keys(src)).toEqual(Object.keys(reactServer))
  })
})
