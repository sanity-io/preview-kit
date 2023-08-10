import 'bulma/css/bulma.min.css'
import { Container } from 'ui/react'
import { unstable__adapter, unstable__environment } from '@sanity/client'
import { Timestamp } from 'ui/react'
import DraftModeButton from './DraftModeButton'
import RefreshButton from './RefreshButton'
import { Suspense } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <Container>
          <DraftModeButton />
          <Suspense>{children}</Suspense>
          <Timestamp date={new Date()} />
          <RefreshButton />
          <script
            type="application/json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                unstable__adapter,
                unstable__environment,
              }),
            }}
          />
        </Container>
      </body>
    </html>
  )
}
