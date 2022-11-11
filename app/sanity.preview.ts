'use client'

import type { GroqStore } from '@sanity/groq-store'
import {
  type Params,
  type UsePreview,
  _checkAuth,
  _definePreview,
  _lazyEventSourcePolyfill,
  _lazyGroqStore,
} from '@sanity/preview-kit'
import { cache, use } from 'react'

import { dataset, projectId } from './config'

export const usePreview: UsePreview = _definePreview({
  projectId,
  dataset,
  importEventSourcePolyfill: () => use(lazyEventSourcePolyfill()),
  importGroqStore: () => use(lazyGroqStore()),
  checkAuth: (_projectId, token) => use(checkAuth(_projectId, token)),
  preload: (store, query, params) => use(preload(store, query, params)),
})

const lazyEventSourcePolyfill = cache(_lazyEventSourcePolyfill)
const lazyGroqStore = cache(_lazyGroqStore)
const checkAuth = cache(_checkAuth)
const preload = cache((store: GroqStore, query: string, params?: Params) =>
  store.query<any>(query, params)
)
