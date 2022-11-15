export default function Container({
  children,
  back = true,
}: {
  children: React.ReactNode
  back?: boolean
}) {
  return (
    <main className="container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          minHeight: '100svh',
          justifyContent: 'center',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {children}
        {back && (
          <section className="section">
            <a href="/" className="button is-light is-link">
              Go back
            </a>
          </section>
        )}
      </div>
    </main>
  )
}
