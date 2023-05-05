'use client'

import { dataset, projectId } from './config'
import { createClient } from './sanity.client'
import { createLiveCache } from './sanity.live'

const liveCache = createLiveCache({ client: createClient() })
