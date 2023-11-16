import type { SerializeFrom } from '@vercel/remix'
import { lazy } from 'react'

import type { loader } from '~/routes'

const PreviewProvider = lazy(() => import('./PreviewProvider'))

export default function LiveStoreVariant({
  previewDrafts,
  children,
  token,
  studioUrl,
}: SerializeFrom<typeof loader> & React.PropsWithChildren) {
  return previewDrafts ? (
    <PreviewProvider token={token!} studioUrl={studioUrl}>{children}</PreviewProvider>
  ) : (
    children
  )
}
