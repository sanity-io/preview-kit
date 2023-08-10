import 'bulma/css/bulma.min.css'
import { AppProps } from 'next/app'

import { getStaticProps } from '.'
import type { InferGetStaticPropsType } from 'next'

export default function App({
  Component,
  pageProps,
}: AppProps<InferGetStaticPropsType<typeof getStaticProps>>) {
  return <Component {...pageProps} />
}
