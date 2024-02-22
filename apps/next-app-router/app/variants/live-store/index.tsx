import { draftMode } from 'next/headers'
import dynamic from 'next/dynamic'
import { VisualEditing } from 'next-sanity'
import { token } from '../../sanity.fetch'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))

export default async function LiveStoreVariant({
  children,
}: React.PropsWithChildren) {
  return (
    <>
      {draftMode().isEnabled ? (
        <><PreviewProvider token={token}>{children}</PreviewProvider><VisualEditing /></>
      ) : (
        children
      )}
    </>
  )
}
