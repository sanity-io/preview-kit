import Link from 'next/link'

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
          height: '100vh',
          maxHeight: '100dvh',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {children}
        {back && (
          <section className="section">
            <Link href="/" className="button is-light is-link">
              Go back
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
