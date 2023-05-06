import { LiveStoreProvider } from '@sanity/preview-kit/live-store'
import { draftsClient } from './sanity.client'
import { useMemo } from 'react'

export default function PreviewProvider({
  children,
  token,
}: {
  children: React.ReactNode
  token: string
}) {
  const client = useMemo(
    () => draftsClient.withConfig({ token, ignoreBrowserTokenWarning: true }),
    [token]
  )
  return <LiveStoreProvider client={client}>{children}</LiveStoreProvider>
}
