import { HistoryAdapterNavigate, enableOverlays } from '@sanity/overlays'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

export default function VisualEditing() {
  const router = useRouter()
  const routerRef = useRef(router)
  const [navigate, setNavigate] = useState<HistoryAdapterNavigate | undefined>()

  useEffect(() => {
    routerRef.current = router
  }, [router])
  useEffect(() => {
    if (!router.isReady) return
    const disable = enableOverlays({
      history: {
        subscribe: (navigate) => {
          setNavigate(() => navigate)
          return () => setNavigate(undefined)
        },
        update: (update) => {
          switch (update.type) {
            case 'push':
              return routerRef.current.push(update.url)
            case 'pop':
              return routerRef.current.back()
            case 'replace':
              return routerRef.current.replace(update.url)
            default:
              throw new Error(`Unknown update type: ${update.type}`)
          }
        },
      },
    })
    return () => disable()
  }, [router.isReady])
  useEffect(() => {
    if (navigate) {
      navigate({ type: 'push', url: router.asPath })
    }
  }, [navigate, router.asPath])

  return null
}
