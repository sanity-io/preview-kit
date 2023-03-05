import groq from 'groq'
import { memo } from 'react'

export const query = groq`count(array::unique(
  *[_type == 'page']{"_id": select(
    _id in path("drafts.**") => _id,
    "drafts." + _id
  )}._id
))
`

export type CountProps = {
  data: number
}

export const Count = memo(function Counter({ data }: CountProps) {
  return (
    <span className="tag is-light">
      Documents: <span className="pl-1 has-text-weight-bold">{data}</span>
    </span>
  )
})
