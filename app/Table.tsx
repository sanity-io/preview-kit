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
  }),
  q.order('_updatedAt desc')
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
    <div className="table-container is-flex-shrink-0">
      <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        {thead}
        <tbody>
          {data.map((type) => (
            <tr key={type._id}>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                {type.title}
              </td>
              <td style={{ whiteSpace: 'nowrap' }} width={400}>
                {type._id}
              </td>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                {type._createdAt?.toJSON()}
              </td>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                {type._updatedAt?.toJSON()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

export const TableFallback = memo(function TableFallback({
  rows,
}: {
  rows: number
}) {
  const trs = Array(rows).fill('')

  return (
    <div className="table-container is-flex-shrink-0">
      <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        {thead}
        <tbody>
          {trs.map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={`${i}`}>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                Loading…
              </td>
              <td style={{ whiteSpace: 'nowrap' }} width={400}>
                &nbsp;
              </td>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                &nbsp;
              </td>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                &nbsp;
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
