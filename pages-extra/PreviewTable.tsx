import { type UsePreview } from '@sanity/preview-kit'
import { type TableProps, query, Table } from 'app/Table'
import { usePreview as _usePreview } from 'pages-extra/utils'

const usePreview: UsePreview<TableProps['data']> = _usePreview

export default function PreviewTableProps({ token }: { token: string | null }) {
  const data = usePreview(token, query) || []
  return <Table data={data} />
}
