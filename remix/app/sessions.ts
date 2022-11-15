import { createCookieSessionStorage } from '@remix-run/node' // or cloudflare/deno

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
    },
  })

export { getSession, commitSession, destroySession }
