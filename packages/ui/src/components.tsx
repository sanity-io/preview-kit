import groq from 'groq'
import { memo } from 'react'
import { RouteSlug } from './utils'

export function PreviewButton({
  preview,
  start,
  stop,
}: {
  preview: boolean
  stop: `/api/exit-preview?slug=${RouteSlug}`
  start: `/api/preview?slug=${RouteSlug}`
}) {
  return (
    <section className="section">
      {preview ? (
        <a href={stop} className="button is-light is-danger">
          Stop preview
        </a>
      ) : (
        <a href={start} className="button is-light is-success">
          Start preview
        </a>
      )}
    </section>
  )
}

export const queryCount = groq`count(array::unique(
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
