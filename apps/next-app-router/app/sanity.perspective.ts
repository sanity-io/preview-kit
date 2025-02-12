import type {ClientPerspective} from 'next-sanity'
import {cookies, draftMode} from 'next/headers'

export async function getPerspective() {
  const {isEnabled} = await draftMode()
  let perspective: Exclude<ClientPerspective, 'raw'> = 'drafts'
  if (isEnabled) {
    const cookieStore = await cookies()
    if (cookieStore.has('sanity-preview-perspective')) {
      const cookie = cookieStore.get('sanity-preview-perspective')
      if (cookie!.value.includes(',')) {
        perspective = cookie!.value.split(',') as unknown as Exclude<ClientPerspective, 'raw'>
      } else {
        perspective = cookie!.value as unknown as Exclude<ClientPerspective, 'raw'>
      }
    }
  }
  return perspective
}
