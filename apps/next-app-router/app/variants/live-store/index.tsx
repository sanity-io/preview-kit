import {draftMode} from 'next/headers'
import dynamic from 'next/dynamic'
import {VisualEditing} from 'next-sanity'
import {token} from '../../sanity.fetch'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))

export default async function LiveStoreVariant({children}: React.PropsWithChildren) {
  const {isEnabled} = await draftMode()
  return (
    <>
      {isEnabled ? (
        <>
          <PreviewProvider token={token}>{children}</PreviewProvider>
          <VisualEditing />
        </>
      ) : (
        children
      )}
    </>
  )
}
