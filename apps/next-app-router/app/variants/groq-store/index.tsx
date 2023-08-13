import { draftMode } from 'next/headers'
import dynamic from 'next/dynamic'
import { token } from '../../sanity.fetch'

const PreviewProvider = dynamic(() => import('./PreviewProvider'))

export default async function GroqStoreVariant({
  children,
}: React.PropsWithChildren) {

  return (
    <>
      {draftMode().isEnabled ? (
        <PreviewProvider token={token}>
          {children}
        </PreviewProvider>
      ) : children}
    </>
  )
}
