import type {InferGetStaticPropsType} from 'next'
import dynamic from 'next/dynamic'
import {VisualEditing} from '@sanity/visual-editing/next-pages-router'

import {getStaticProps} from '../../pages'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))

export default function LiveStoreVariant({
  children,
  draftMode,
  token,
}: InferGetStaticPropsType<typeof getStaticProps> & React.PropsWithChildren) {
  return draftMode ? (
    <>
      <PreviewProvider token={token!}>{children}</PreviewProvider>
      <VisualEditing />
    </>
  ) : (
    children
  )
}
