'use client'

import {LiveQueryProvider} from '@sanity/preview-kit'
import {client} from './sanity.client'
import type {ClientPerspective} from 'next-sanity'

export default function PreviewProvider({
  children,
  token,
  perspective,
}: {
  children: React.ReactNode
  token: string
  perspective: Exclude<ClientPerspective, 'raw'>
}) {
  if (!token) throw new TypeError('Missing token')
  return (
    <LiveQueryProvider client={client} token={token} logger={console} perspective={perspective}>
      {children}
    </LiveQueryProvider>
  )
}
