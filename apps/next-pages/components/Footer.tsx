import groq from 'groq'
import { memo } from 'react'

export const query = groq`count(array::unique(
  *[_type == 'page']{"_id": select(
    _id in path("drafts.**") => _id,
    "drafts." + _id
  )}._id
))
`

export type FooterProps = {
  data: number
}

export const Footer = memo(function Footer({ data }: FooterProps) {
  return (
    <span className="tag is-light">
      Documents: <span className="pl-1 has-text-weight-bold">{data}</span>
    </span>
  )
})
