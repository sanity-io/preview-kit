import dynamic from 'next/dynamic'

const DefaultVariant = dynamic(() => import('./variants/default'))
const GroqStoreVariant = dynamic(() => import('./variants/groq-store'))
const LiveStoreVariant = dynamic(() => import('./variants/live-store'))
const NoStoreVariant = dynamic(() => import('./variants/no-store'))

export default function Page() {
  switch (process.env.VARIANT || 'default') {
    case 'default':
      return <DefaultVariant />
    case 'groq-store':
      return <GroqStoreVariant />
    case 'live-store':
      return <LiveStoreVariant />
    case 'no-store':
      return <NoStoreVariant />
    default:
      throw new Error(`Unknown variant: ${process.env.VARIANT}`)
  }
}
