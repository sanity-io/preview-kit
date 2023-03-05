import { Link } from '@remix-run/react'

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
          padding: '20px',
        }}
      >
        {children}
        {back && (
          <section className="section">
            <Link prefetch="intent" to="/" className="button is-light is-link">
              Go back
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}
