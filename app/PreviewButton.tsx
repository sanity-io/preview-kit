type Variant = 'cookie' | 'token' | 'token-edge' | 'cookie-edge'

export default function PreviewButton({
  preview,
  start,
  stop,
}: {
  preview: boolean
  stop: `/api/exit-preview-next${12 | 13}-${Variant}`
  start: `/api/preview-next${12 | 13}-${Variant}`
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
