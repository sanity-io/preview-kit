import type { LoaderArgs } from '@vercel/remix'
import { getSession, commitSession } from '~/sessions'

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }
  session.set('view', 'previewDrafts')

  return new Response(null, {
    status: 307,
    headers: {
      Location: '/',
      'Set-Cookie': await commitSession(session),
    },
  })
}
