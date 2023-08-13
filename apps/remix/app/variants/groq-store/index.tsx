import type { SerializeFrom } from '@vercel/remix'
import { lazy } from 'react'

import type { loader } from '~/routes'

const PreviewProvider = lazy(() => import('./PreviewProvider'))

export default function GroqStoreVariant({
  previewDrafts,
  children,
  token,
}: SerializeFrom<typeof loader> & React.PropsWithChildren) {
  return previewDrafts ? (
    <PreviewProvider token={token!}>{children}</PreviewProvider>
  ) : (
    children
  )
}
