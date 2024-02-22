import { createClient } from '@sanity/client'
import { LiveQueryProvider } from '@sanity/preview-kit'
import { useState } from 'react'

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
      perspective: 'published',
      stega: {
        enabled: true,
        studioUrl,
        logger: console,
      },
    })
  })
  return (
      <LiveQueryProvider client={client} token={token} logger={console}>
        {children}
      </LiveQueryProvider>
  )
}
