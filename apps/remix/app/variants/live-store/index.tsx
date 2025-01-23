import type {SerializeFrom} from '@vercel/remix'
import {StrictMode, lazy} from 'react'
import {VisualEditing} from '@sanity/visual-editing/remix'

import type {loader} from '~/routes/_index'

const PreviewProvider = lazy(() => import('./PreviewProvider'))

export default function LiveStoreVariant({
  previewDrafts,
  children,
  token,
  studioUrl,
  perspective,
}: SerializeFrom<typeof loader> & React.PropsWithChildren) {
  return previewDrafts ? (
    <StrictMode>
      <PreviewProvider token={token!} studioUrl={studioUrl} perspective={perspective}>
        {children}
      </PreviewProvider>
      <VisualEditing />
    </StrictMode>
  ) : (
    children
  )
}
