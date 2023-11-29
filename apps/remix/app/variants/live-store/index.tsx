import type { SerializeFrom } from '@vercel/remix'
import { StrictMode, lazy } from 'react'

import type { loader } from '~/routes'

const PreviewProvider = lazy(() => import('./PreviewProvider'))

export default function LiveStoreVariant({
  previewDrafts,
  children,
  token,
  studioUrl,
}: SerializeFrom<typeof loader> & React.PropsWithChildren) {
  return previewDrafts ? (
    <StrictMode>
      <PreviewProvider token={token!} studioUrl={studioUrl}>
        {children}
      </PreviewProvider>
    </StrictMode>
  ) : (
    children
  )
}
