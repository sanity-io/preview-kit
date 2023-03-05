import type { LoaderArgs } from '@remix-run/node'
import { previewSlug } from '~/sanity/config'
import { getSession, commitSession } from '~/sessions'

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const url = new URL(request.url)
  const slug = previewSlug(url.searchParams.get('slug') as any)

  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }
  session.set('token', token)

  return new Response(null, {
    status: 307,
    headers: {
      Location: `/${slug}`,
      'Set-Cookie': await commitSession(session, { path: `/${slug}` }),
    },
  })
}
