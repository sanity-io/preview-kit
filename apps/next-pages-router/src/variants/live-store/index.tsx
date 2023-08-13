import type { InferGetStaticPropsType } from 'next'
import dynamic from 'next/dynamic'

import { getStaticProps } from '../../pages'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))

export default function Page({
  children,
  draftMode,
  token,
}: InferGetStaticPropsType<typeof getStaticProps> & React.PropsWithChildren) {
  return draftMode ? (
    <PreviewProvider token={token!}>{children}</PreviewProvider>
  ) : (
    children
  )
}
