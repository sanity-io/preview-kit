import type { LoaderArgs } from '@remix-run/node'
import { previewSlug } from '~/sanity/config'
import { getSession, destroySession } from '~/sessions'

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'))
  const url = new URL(request.url)
  const slug = previewSlug(url.searchParams.get('slug') as any)
  return new Response(null, {
    status: 307,
    headers: {
      Location: `/${slug}`,
      'Set-Cookie': await destroySession(session, { path: `/${slug}` }),
    },
  })
}
