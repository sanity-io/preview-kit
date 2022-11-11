import { definePreview, type UsePreview } from '@sanity/preview-kit'
import { dataset, projectId } from 'app/config'

export const usePreview: UsePreview = definePreview({ projectId, dataset })
