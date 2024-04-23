'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useTransition} from 'react'
import {useFormStatus} from 'react-dom'
import {Button} from 'ui/react'
import {revalidate} from './actions'
import {useIsEnabled} from '@sanity/preview-kit'

function useRefresh() {
  const {pending} = useFormStatus()
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
  const isLive = useIsEnabled()

  return (
    <form
      action={revalidate}
      className="section"
      title={
        isLive
          ? 'Live queries are enabled and refreshes queries automatically, refreshing manually is unnecessary'
          : undefined
      }
    >
      <Button isLoading={loading} disabled={isLive}>
        Refresh
      </Button>
    </form>
  )
}
