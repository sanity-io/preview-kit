'use client'

import dynamic from 'next/dynamic'

// Re-exporting in a file with `use client` ensures the component stays server-only
// and isn't preloaded in the client bundle, instead it's loaded only on demand.

export default dynamic(
  () => import('@sanity/preview-kit/internals/live-query-client'),
) as typeof import('@sanity/preview-kit/internals/live-query-client').default
