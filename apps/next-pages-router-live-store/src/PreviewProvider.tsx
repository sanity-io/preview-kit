import { LiveQueryProvider } from '@sanity/preview-kit'
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
  return (
    <LiveQueryProvider
      client={client}
      experimental__turboSourceMap
      logger={console}
    >
      {children}
    </LiveQueryProvider>
  )
}
