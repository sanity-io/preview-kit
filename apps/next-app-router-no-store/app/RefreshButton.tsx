'use client'

import { useListeningQueryStatus } from '@sanity/preview-kit'
import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import { experimental_useFormStatus as useFormStatus } from 'react-dom'
import { Button, tableQuery } from 'ui/react'
import { revalidate } from './actions'

function useRefresh() {
  const { pending } = useFormStatus()
  const router = useRouter()
  const [loading, startTransition] = useTransition()
  const status = useListeningQueryStatus(tableQuery)
  useEffect(() => {
    if (!pending) {
      startTransition(() => router.refresh())
    }
  }, [pending, router])

  return pending || loading || status === 'loading'
}

export default function RefreshButton() {
  const loading = useRefresh()

  return (
    <form action={revalidate} className="section">
      <Button isLoading={loading}>Refresh</Button>
    </form>
  )
}
