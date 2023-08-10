import 'bulma/css/bulma.min.css'
import { AppProps } from 'next/app'
import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import { useEffect } from 'react'
import {
  Button,
  Container,
  PreviewDraftsButton,
  Timestamp,
  ViewPublishedButton,
} from 'ui/react'
import { getStaticProps } from '.'
import type { InferGetStaticPropsType } from 'next'

export default function App({
  Component,
  pageProps,
}: AppProps<InferGetStaticPropsType<typeof getStaticProps>>) {
  const { draftMode, timestamp, server__adapter, server__environment } =
    pageProps
  useEffect(() => {
    console.log({
      client__adapter: adapter,
      client__environment: environment,
    })
  }, [])

  return (
    <Container>
      <form style={{ display: 'contents' }}>
        {draftMode ? (
          <ViewPublishedButton formAction="/api/disable-draft" />
        ) : (
          <PreviewDraftsButton formAction="/api/draft" />
        )}
      </form>
      <Component {...pageProps} />
      <Timestamp date={timestamp} />
      <RefreshButton />
      <script
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ server__adapter, server__environment }),
        }}
      />
    </Container>
  )
}

function RefreshButton() {
  return (
    <form action="/api/revalidate" className="section">
      <Button>Refresh</Button>
    </form>
  )
}
