import { type ReactNode, Suspense, useEffect, useReducer } from 'react'

/** @public */
export type PreviewSuspenseProps = {
  children: ReactNode
  fallback: ReactNode
}

/**
 * Preview Mode really needs to only load as client-only, as it uses EventSource to stream data from Content Lake.
 * We don't want to run anything on the server but the fallback until it's loaded.
 * It's used in the same way as `React.Suspense`, it just also defers render until the component is mounted:
 * ```tsx
 * import {PreviewSuspense} from '@sanity/preview-kit'
 *
 * export default function App() {
 *   return (
 *     <PreviewSuspense fallback={<div>Loading preview...</div>}>
 *       <ComponentUsingPreviewHooks />
 *     </PreviewSuspense>
 *   )
 * }
 * ```
 * @public
 */
export function PreviewSuspense({ children, fallback }: PreviewSuspenseProps) {
  const [mounted, mount] = useReducer(() => true, false)
  useEffect(mount, [mount])

  return (
    <Suspense fallback={fallback}>{mounted ? children : fallback}</Suspense>
  )
}
