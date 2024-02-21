import type { LoaderFunctionArgs } from '@vercel/remix'
import { getSession, destroySession } from '~/sessions'

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  return new Response(null, {
    status: 307,
    headers: {
      Location: '/',
      'Set-Cookie': await destroySession(session),
    },
  })
}
