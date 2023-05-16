import type { LoaderArgs } from '@vercel/remix'
import { getSession, destroySession } from '~/sessions'

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  return new Response(null, {
    status: 307,
    headers: {
      Location: '/',
      'Set-Cookie': await destroySession(session),
    },
  })
}
