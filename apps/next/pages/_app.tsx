import 'bulma/css/bulma.min.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>@sanity/preview-kit</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
