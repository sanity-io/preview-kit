'use client'

import { type UsePreview, definePreview } from '@sanity/preview-kit'

import { dataset, projectId } from './config'
import { type CountProps, Count, query } from './Count'

let alerted = false

const usePreview: UsePreview<CountProps['data']> = definePreview({
  projectId,
  dataset,
  includeTypes: ['page'],
  overlayDrafts: false,
  onPublicAccessOnly: () => {
    if (!alerted) {
      // eslint-disable-next-line no-alert
      alert('You are not logged in. You will only see public data.')
      alerted = true
    }
  },
})

export default function PreviewCount({
  initialData,
}: {
  initialData: CountProps['data']
}) {
  const data = usePreview(null, query, {}, initialData)
  return <Count data={data} />
}
