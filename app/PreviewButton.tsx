import type { PreviewSlug } from 'app/config'

export default function PreviewButton({
  preview,
  start,
  stop,
}: {
  preview: boolean
  stop: `/api/exit-preview?slug=${PreviewSlug}`
  start: `/api/preview?slug=${PreviewSlug}`
}) {
  return (
    <section className="section">
      <a
        href={preview ? stop : start}
        className={`button is-light ${preview ? 'is-danger' : 'is-success'}`}
      >
        {preview ? 'Stop preview' : 'Start preview'}
      </a>
    </section>
  )
}
