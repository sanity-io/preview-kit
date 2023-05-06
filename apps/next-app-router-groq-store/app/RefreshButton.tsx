'use client'

import { Button } from 'ui/react'
import { useRouter } from 'next/navigation'

export default function RefreshButton() {
  const router = useRouter()

  return (
    <form
      className="section"
      onSubmit={(event) => {
        event.preventDefault()
        router.refresh()
      }}
    >
      <Button>Refresh</Button>
    </form>
  )
}
