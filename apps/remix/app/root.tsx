import type { MetaFunction, LinksFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import styles from 'bulma/css/bulma.min.css'

import * as projectDetails from '~/sanity/config'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: '@sanity/preview-kit + remix',
  viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export async function loader() {
  return json({ ENV: projectDetails })
}

export default function App() {
  const data = useLoaderData()

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
