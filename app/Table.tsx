import { q } from 'groqd'
import { memo } from 'react'

const { query, schema } = q(
  '*',
  q.filter("_type == 'page'"),
  q.grab({
    _id: q.string(),
    _createdAt: q.date().optional(),
    _updatedAt: q.date().optional(),
    title: q.string().optional(),
  })
)

export { query }

export type TableProps = {
  data: unknown[]
}

const thead = (
  <thead>
    <tr>
      <th>title</th>
      <th>_id</th>
      <th>_createdAt</th>
      <th>_updatedAt</th>
    </tr>
  </thead>
)

export const Table = memo(function Table(props: TableProps) {
  const data = schema.parse(props.data)
  return (
    <table className="table is-fullwidth">
      {thead}
      <tbody>
        {data.map((type) => (
          <tr key={type._id}>
            <td>{type.title}</td>
            <td width={400}>{type._id}</td>
            <td width={300}>{type._createdAt?.toJSON()}</td>
            <td width={300}>{type._updatedAt?.toJSON()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
})

export const TableFallback = memo(function TableFallback({
  rows,
}: {
  rows: number
}) {
  const trs = Array(rows).fill('')

  return (
    <table className="table is-fullwidth">
      {thead}
      <tbody>
        {trs.map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={`${i}`}>
            <td>Loading…</td>
            <td width={400}>&nbsp;</td>
            <td width={300}>&nbsp;</td>
            <td width={300}>&nbsp;</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
})
