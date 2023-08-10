import DefaultVariant from './variants/default'
import GroqStoreVariant from './variants/groq-store'
import LiveStoreVariant from './variants/live-store'
import NoStoreVariant from './variants/no-store'

export default async function Page() {
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
