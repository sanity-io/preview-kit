import { lazy } from 'react'

const GroqStoreVariant = lazy(() => import('./variants/groq-store'))
const LiveStoreVariant = lazy(() => import('./variants/live-store'))

export default function Variant(props: React.PropsWithChildren) {
  switch (process.env.VARIANT || 'default') {
    case 'default':
      return <>{props.children}</>
    case 'groq-store':
      return <GroqStoreVariant {...props} />
    case 'live-store':
      return <LiveStoreVariant {...props} />
    default:
      throw new Error(`Unknown variant: ${process.env.VARIANT}`)
  }
}
