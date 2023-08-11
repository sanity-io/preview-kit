import 'bulma/css/bulma.min.css'
import { Container, Timestamp } from 'ui/react'
import { unstable__adapter, unstable__environment } from '@sanity/client'
import DraftModeButton from './DraftModeButton'
import RefreshButton from './RefreshButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `next-app-router-${process.env.VARIANT || 'default'}`,
}

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
          {children}
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
