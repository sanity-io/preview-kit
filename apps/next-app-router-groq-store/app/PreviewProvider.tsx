'use client'

import { GroqStoreProvider } from '@sanity/preview-kit/groq-store'
import { dataset, projectId } from './sanity.env'

export default function PreviewProvider({
  children,
  token,
}: {
  children: React.ReactNode
  token: string
}) {
  return (
    <GroqStoreProvider
      projectId={projectId}
      dataset={dataset}
      token={token}
      documentLimit={Infinity}
    >
      {children}
    </GroqStoreProvider>
  )
}
