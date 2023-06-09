import {
  GroqStoreProvider,
  type GroqStoreProviderProps,
} from '@sanity/preview-kit/groq-store'

export default function PreviewProvider({
  children,
  token,
  projectId,
  dataset,
}: {
  children: React.ReactNode
  token: string
} & Pick<GroqStoreProviderProps, 'projectId' | 'dataset'>) {
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
