'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import { experimental_useFormStatus as useFormStatus } from 'react-dom'
import { Button } from 'ui/react'
import { revalidate } from './actions'

function useRefresh() {
  const { pending } = useFormStatus()
  const router = useRouter()
  const [loading, startTransition] = useTransition()
  useEffect(() => {
    if (!pending) {
      startTransition(() => router.refresh())
    }
  }, [pending, router])

  return pending || loading
}

export default function RefreshButton() {
  const loading = useRefresh()

  return (
    <form action={revalidate} className="section">
      <Button isLoading={loading}>Refresh</Button>
    </form>
  )
}
