import DefaultVariant from './variants/default'

export default async function Page() {
  switch (process.env.VARIANT || 'default') {
    case 'default':
      return <DefaultVariant />
    case 'groq-store':
      case 'live-store':
        case 'no-store':
    default:
      throw new Error(`Unknown variant: ${process.env.VARIANT}`)
  }
}
