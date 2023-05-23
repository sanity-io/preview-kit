import { LiveStoreProvider } from '@sanity/preview-kit/live-store'
import { useState } from 'react'
import { getClient } from '~/utils'

export default function PreviewProvider({
  children,
  projectId,
  dataset,
  apiVersion,
  useCdn,
  token,
}: {
  children: React.ReactNode
} & Required<Parameters<typeof getClient>[1]>) {
  const [client] = useState(() =>
    getClient(true, { projectId, dataset, apiVersion, useCdn, token })
  )
  return <LiveStoreProvider client={client}>{children}</LiveStoreProvider>
}
