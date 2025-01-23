import {LiveQueryProvider} from '@sanity/preview-kit'
import {client} from './sanity.client'
import {useRouter} from 'next/router'
import type {ClientPerspective} from 'next-sanity'
import {useEffect, useState} from 'react'

export default function PreviewProvider({
  children,
  token,
}: {
  children: React.ReactNode
  token: string
}) {
  if (!token) throw new TypeError('Missing token')

  const router = useRouter()

  const [perspective, setPerspective] = useState<Exclude<ClientPerspective, 'raw'>>('previewDrafts')
  useEffect(() => {
    const maybePerspective = router.query['sanity-preview-perspective'] as any
    if (router.isReady && maybePerspective) {
      setPerspective(
        (maybePerspective.includes(',')
          ? maybePerspective.split(',')
          : maybePerspective) as unknown as Exclude<ClientPerspective, 'raw'>,
      )
    }
  }, [router.isReady, router.query])

  return (
    <LiveQueryProvider client={client} token={token} logger={console} perspective={perspective}>
      {children}
    </LiveQueryProvider>
  )
}
