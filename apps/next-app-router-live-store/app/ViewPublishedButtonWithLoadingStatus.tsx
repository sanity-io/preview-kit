'use client'

import { tableQuery } from 'ui/react'
import { ViewPublishedButton } from 'ui/react'
import { useListeningQueryStatus } from '@sanity/preview-kit'

export default function ViewPublishedButtonWithLoadingStatus() {
  const status = useListeningQueryStatus(tableQuery)

  return <ViewPublishedButton isLoading={status === 'loading'} />
}
