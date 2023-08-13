'use client'

import dynamic from 'next/dynamic'

// Re-exporting in a file with `use client` ensures the components in here stays server-only
// when we're not in draft mode.

export const PreviewTable = dynamic(() =>
  import('./_exports').then((mod) => mod.Table),
)
export const PreviewFooter = dynamic(() =>
  import('./_exports').then((mod) => mod.Footer),
)
