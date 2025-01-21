'use client'

// Re-exporting in a file with `use client` ensures the components in here stays server-only
// when we're not in draft mode.

import {Table, Footer, tableQuery, footerQuery} from 'ui/react'
import {useLiveQuery} from '@sanity/preview-kit'

export function PreviewTable(props: {initialData: unknown}) {
  const [table] = useLiveQuery(props.initialData, tableQuery)
  return <Table data={table} />
}

export function PreviewFooter(props: {initialData: number}) {
  const [footer] = useLiveQuery(props.initialData, footerQuery)
  return <Footer data={footer} />
}
