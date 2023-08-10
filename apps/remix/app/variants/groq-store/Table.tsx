import type { TableProps } from 'ui/react'
import { tableQuery, Table as UiTable } from 'ui/react'
import { useLiveQuery } from '@sanity/preview-kit'

export default function Table(props: TableProps) {
  const [data] = useLiveQuery<TableProps['data']>(props.data, tableQuery)

  return <UiTable data={data} />
}
