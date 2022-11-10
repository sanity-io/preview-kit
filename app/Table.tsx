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

export const Table = memo(function Table(props: TableProps) {
  const data = schema.parse(props.data)
  return (
    <table className="table">
      <thead>
        <tr>
          <th>title</th>
          <th>_id</th>
          <th>_createdAt</th>
          <th>_updatedAt</th>
        </tr>
      </thead>
      <tbody>
        {data.map((type) => (
          <tr key={type._id}>
            <td>{type.title}</td>
            <td>{type._id}</td>
            <td>{type._createdAt?.toJSON()}</td>
            <td>{type._updatedAt?.toJSON()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
})

export const TableFallback = () => <>Loading Table...</>
