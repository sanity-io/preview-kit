import { LiveQueryProvider } from '@sanity/preview-kit'
import { getClient } from './sanity.client'
import { useMemo } from 'react'

export default function PreviewProvider({
  children,
  token,
}: {
  children: React.ReactNode
  token: string
}) {
  const client = useMemo(() => getClient({ token }), [token])
  return (
    <LiveQueryProvider client={client} logger={console}>
      {children}
    </LiveQueryProvider>
  )
}
