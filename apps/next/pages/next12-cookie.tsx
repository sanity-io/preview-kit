import PreviewButton from 'apps/next/app/PreviewButton'
import PreviewTemplate from 'apps/next/app/PreviewTemplate'
import { createClient } from 'apps/next/app/sanity.client'
import Container from 'apps/next/components/Container'
import { FooterProps, query as footerQuery } from 'apps/next/components/Footer'
import PageTemplate from 'apps/next/components/PageTemplate'
import {
  query as tableQuery,
  type TableProps,
} from 'apps/next/components/Table'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'

export const getStaticProps: GetStaticProps<{
  preview: boolean
  tableData: TableProps['data']
  footerData: FooterProps['data']
}> = async ({ preview = false }) => {
  const revalidate = 60

  if (preview) {
    const client = createClient().withConfig({
      // eslint-disable-next-line no-process-env
      token: process.env.SANITY_API_READ_TOKEN,
    })

    return {
      props: {
        preview,
        tableData: [],
        footerData: await client.fetch(footerQuery),
      },
      revalidate,
    }
  }

  const client = createClient()
  const tablePromise = client.fetch(tableQuery)
  const footerPromise = client.fetch(footerQuery)

  return {
    props: {
      preview,
      tableData: await tablePromise,
      footerData: await footerPromise,
    },
    revalidate,
  }
}

export default function Next12CookiePage({
  preview,
  tableData,
  footerData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      <PreviewButton
        preview={!!preview}
        start="/api/preview?slug=next12-cookie"
        stop="/api/exit-preview?slug=next12-cookie"
      />
      {preview ? (
        <PreviewTemplate token={null} footerData={footerData} />
      ) : (
        <PageTemplate tableData={tableData} footerData={footerData} />
      )}
    </Container>
  )
}
