export default function PreviewButton({
  preview,
  start,
  stop,
}: {
  preview: boolean
  stop: `/api/exit-preview-next${12 | 13}-${'cookie' | 'token'}`
  start: `/api/preview-next${12 | 13}-${'cookie' | 'token'}`
}) {
  return (
    <section className="section">
      <a
        href={preview ? stop : start}
        className={`button is-light ${preview ? 'is-danger' : 'is-primary'}`}
      >
        {preview ? 'Stop preview' : 'Start preview'}
      </a>
    </section>
  )
}
