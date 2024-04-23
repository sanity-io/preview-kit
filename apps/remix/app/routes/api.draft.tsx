import type {LoaderFunctionArgs} from '@vercel/remix'
import {token} from '~/sanity'
import {getSession, commitSession} from '~/sessions'

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }
  session.set('view', 'previewDrafts')

  return new Response(null, {
    status: 307,
    headers: {
      'Location': '/',
      'Set-Cookie': await commitSession(session),
    },
  })
}
