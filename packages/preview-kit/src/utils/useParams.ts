import type { QueryParams } from '@sanity/client'
import { useMemo } from 'react'

/**
 * Return params that are stable with deep equal as long as the key order is the same
 * @internal
 */
export function useParams(
  params?: undefined | null | QueryParams,
): QueryParams {
  const stringifiedParams = useMemo(
    () => JSON.stringify(params || {}),
    [params],
  )
  return useMemo(() => JSON.parse(stringifiedParams), [stringifiedParams])
}
