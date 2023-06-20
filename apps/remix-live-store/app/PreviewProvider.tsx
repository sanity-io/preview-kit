import { LiveQueryProvider } from '@sanity/preview-kit'
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
