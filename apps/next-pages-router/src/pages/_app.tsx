import 'bulma/css/bulma.min.css'
import { AppProps } from 'next/app'
import Head from 'next/head'

import { getStaticProps } from '.'
import type { InferGetStaticPropsType } from 'next'

export default function App({
  Component,
  pageProps,
}: AppProps<InferGetStaticPropsType<typeof getStaticProps>>) {
  return (
    <>
      <Head>
        <title>{`next-pages-router-${pageProps.variant}`}</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
