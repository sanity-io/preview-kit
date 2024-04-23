'use client'

// Re-exporting in a file with `use client` ensures the components in here stays server-only
// when we're not in draft mode.

export {Table as PreviewTable, Footer as PreviewFooter} from 'ui/react'
