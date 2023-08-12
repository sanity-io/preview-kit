import dynamic from 'next/dynamic'

const DefaultVariant = dynamic(() => import('./variants/default'))
const GroqStoreVariant = dynamic(() => import('./variants/groq-store'))
const LiveStoreVariant = dynamic(() => import('./variants/live-store'))
const NoStoreVariant = dynamic(() => import('./variants/no-store'))

export default function Variant(props: React.PropsWithChildren) {
  switch (process.env.VARIANT || 'default') {
    case 'default':
      return <DefaultVariant {...props} />
    case 'groq-store':
      return <GroqStoreVariant {...props} />
    case 'live-store':
      return <LiveStoreVariant {...props} />
    case 'no-store':
      return <NoStoreVariant {...props} />
    default:
      throw new Error(`Unknown variant: ${process.env.VARIANT}`)
  }
}
