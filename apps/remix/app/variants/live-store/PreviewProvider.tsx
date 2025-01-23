import {createClient, type ClientPerspective} from '@sanity/client'
import {LiveQueryProvider} from '@sanity/preview-kit'
import {useState} from 'react'

export default function PreviewProvider({
  children,
  studioUrl,
  token,
  perspective,
}: {
  children: React.ReactNode
  studioUrl: string
  token: string
  perspective: Exclude<ClientPerspective, 'raw'>
}) {
  if (!token) throw new TypeError('Missing token')
  if (!studioUrl) throw new TypeError('Missing studioUrl')
  const [client] = useState(() => {
    const projectId = 'pv8y60vp'
    const dataset = 'production'
    const apiVersion = 'X'
    const useCdn = false
    return createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn,
      perspective: 'published',
      stega: {
        enabled: true,
        studioUrl,
        logger: console,
      },
    })
  })
  return (
    <LiveQueryProvider client={client} token={token} logger={console} perspective={perspective}>
      {children}
    </LiveQueryProvider>
  )
}
