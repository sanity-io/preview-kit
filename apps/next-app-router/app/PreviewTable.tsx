'use client'

import { TableProps, tableQuery, Table } from 'ui/react'
import { useLiveQuery } from '@sanity/preview-kit/use-live-query'

export default function PreviewTable(props: TableProps) {
  const [data] = useLiveQuery<TableProps['data']>(props.data, tableQuery)

  return <Table data={data} />
}
