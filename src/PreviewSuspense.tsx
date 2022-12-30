import { type ReactNode, Suspense, useSyncExternalStore } from 'react'

/** @public */
export type PreviewSuspenseProps = {
  children: ReactNode
  fallback: ReactNode
}

/**
 * Preview Mode really needs to only load as client-only, as it uses EventSource to stream data from Content Lake.
 * We don't want to run anything on the server but the fallback until it's loaded.
 * It's used in the same way as `React.Suspense`, it just defers render to client only and always render a fallback on the server:
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
  const ready = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return <Suspense fallback={fallback}>{ready ? children : fallback}</Suspense>
}

function subscribe() {
  // We're not actually listening to any events, we just need to know if the client is ready
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return () => {}
}

function getSnapshot() {
  // Just a check if we're in the browser or nah
  return typeof document !== 'undefined'
}

function getServerSnapshot() {
  // Never render on the server
  return false
}
