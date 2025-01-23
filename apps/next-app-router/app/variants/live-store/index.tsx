import {draftMode, cookies} from 'next/headers'
import dynamic from 'next/dynamic'
import {VisualEditing, type ClientPerspective} from 'next-sanity'
import {token} from '../../sanity.fetch'
import {getPerspective} from '../../sanity.perspective'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))

export default async function LiveStoreVariant({children}: React.PropsWithChildren) {
  const {isEnabled} = await draftMode()
  const perspective = await getPerspective()

  return (
    <>
      {isEnabled ? (
        <>
          <PreviewProvider token={token} perspective={perspective}>
            {children}
          </PreviewProvider>
          <VisualEditing />
        </>
      ) : (
        children
      )}
    </>
  )
}
