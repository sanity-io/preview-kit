import type { UsePreview } from '@sanity/preview-kit'
import { usePreview as _usePreview } from '~/sanity/preview'
import { type TableProps, query, Table } from './Table'

const usePreview: UsePreview<TableProps['data']> = _usePreview

export default function PreviewTable({ token }: { token: string | null }) {
  const data = usePreview(token, query) || []
  return <Table data={data} />
}
