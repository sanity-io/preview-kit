import { type UsePreview, definePreview } from '@sanity/preview-kit'
import { dataset, projectId } from 'app/config'

let alerted = false

export const usePreview: UsePreview = definePreview({
  projectId,
  dataset,
  includeTypes: ['page'],
  onPublicAccessOnly: () => {
    if (!alerted) {
      // eslint-disable-next-line no-alert
      alert('You are not logged in. You will only see public data.')
      alerted = true
    }
  },
})
