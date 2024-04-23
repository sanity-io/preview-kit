import {redirect} from 'next/navigation'

import {draftMode} from 'next/headers'

export async function GET(request: Request) {
  draftMode().disable()
  redirect('/')
}
