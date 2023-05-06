'use client'

import { createClient } from './sanity.client'
import { useLiveCache } from './sanity.live'

import { LiveContentProvider as SanityLiveContentProvider } from './sanity.live'

import { query as tableQuery, Table } from 'components/Table'
import { query as footerQuery, Footer } from 'components/Footer'
import { useMemo } from 'react'

export function LiveContentProvider({
  token,
  children,
}: {
  token: string | null
  children: React.ReactNode
}) {
  const client = useMemo(
    () => createClient().withConfig({ token: token || undefined }),
    [token]
  )
  return (
    <SanityLiveContentProvider client={client}>
      {children}
    </SanityLiveContentProvider>
  )
}

export function PreviewTable() {
  const data = useLiveCache(tableQuery) as unknown as any
  console.log({ data })
  if (!data) return null
  return <Table data={data} />
}

export function PreviewFooter() {
  const data = useLiveCache(footerQuery) as unknown as any
  console.log({ data })
  if (!data) return null
  return <Footer data={data} />
}
