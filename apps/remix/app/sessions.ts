import {createCookieSessionStorage} from '@vercel/remix'

const {getSession, commitSession, destroySession} = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    secrets: [process.env.NODE_ENV, process.env.VERCEL_GIT_COMMIT_SHA as string],
  },
})

export {getSession, commitSession, destroySession}
