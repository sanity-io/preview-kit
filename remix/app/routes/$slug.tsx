import { suspend } from 'suspend-react'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { type TableProps, query as tableQuery } from 'components/Table'
import { type FooterProps, query as footerQuery } from 'components/Footer'

import { client as _client } from '~/sanity/client'

import Container from 'components/Container'
import { previewSlug } from '~/sanity/config'
import { getSession } from '~/sessions'
import PageTemplate from 'components/PageTemplate'
import PreviewTemplate from '../../components/PreviewTemplate'

export const loader = async ({ params, request }: LoaderArgs) => {
  const session = await getSession(request.headers.get('Cookie'))
  const slug = previewSlug(params.slug as any)
  const preview = session.has('token')
  const token = preview && slug.endsWith('-token') ? session.get('token') : null
  const client = preview
    ? _client.withConfig({ token: session.get('token') })
    : _client

  const tablePromise: Promise<TableProps['data']> = preview
    ? Promise.resolve([])
    : client.fetch(tableQuery)
  const footerPromise: Promise<FooterProps['data']> = client.fetch(footerQuery)

  return json({
    slug,
    tableData: await tablePromise,
    footerData: await footerPromise,
    preview,
    // DON'T DO THIS IN PRODUCTION -- it's for demo purposes only using a dataset that don't contain any sensitive data and is intended to be publicly readable
    token,
  })
}

export default function ProductPage() {
  const { slug, tableData, footerData, preview, token } =
    useLoaderData<typeof loader>()

  const button = (
    <section className="section">
      <a
        href={
          preview
            ? `/api/exit-preview?slug=${slug}`
            : `/api/preview?slug=${slug}`
        }
        className={`button is-light ${preview ? 'is-danger' : 'is-success'}`}
      >
        {preview ? 'Stop preview' : 'Start preview'}
      </a>
    </section>
  )

  if (preview) {
    return (
      <Container>
        {button}
        <PreviewTemplate token={token} footerData={footerData} />
      </Container>
    )
  }

  return (
    <Container>
      {button}
      <PageTemplate tableData={tableData} footerData={footerData} />
    </Container>
  )
}
