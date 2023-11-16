import { createClient } from '@sanity/preview-kit/client'
import { LiveQueryProvider } from '@sanity/preview-kit'
import { useState } from 'react'
import VisualEditing from './VisualEditing'

export default function PreviewProvider({
  children,
  studioUrl,
  token,
}: {
  children: React.ReactNode
  studioUrl: string
  token: string
}) {
  if (!token) throw new TypeError('Missing token')
  if (!studioUrl) throw new TypeError('Missing studioUrl')
  const [client] = useState(() => {

    const projectId = 'pv8y60vp'
    const dataset = 'production'
    const apiVersion = '2022-11-15'
    const useCdn = false
    return createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn,
      studioUrl,
      logger: console,
      encodeSourceMap: true,
      perspective: 'published',
    })
    

  })
  return (<>
    <LiveQueryProvider client={client} token={token} logger={console}>
      {children}
    </LiveQueryProvider>
    <VisualEditing studioUrl={studioUrl} />
    </>
  )
}
