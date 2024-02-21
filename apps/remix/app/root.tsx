import { type MetaFunction, type LinksFunction, json } from '@vercel/remix'

import { Container } from 'ui/react'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

export const loader = async () => {
  return json({ title: `remix-${process.env.VARIANT || 'default'}` })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { charset: 'utf-8' },
    { viewport: 'width=device-width,initial-scale=1' },
    { title: data?.title },
  ]
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: 'https://esm.sh/bulma/css/bulma.min.css' },
]

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Container>
          <Outlet />
        </Container>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
