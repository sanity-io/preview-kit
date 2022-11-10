export default function PreviewButton({
  preview,
  start,
  stop,
}: {
  preview: boolean
  stop: `/api/exit-preview-${string}`
  start: `/api/preview-${string}`
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
