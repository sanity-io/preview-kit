'use server'

import { revalidateTag } from 'next/cache'

export async function revalidate() {
  await revalidateTag('pages')
}
