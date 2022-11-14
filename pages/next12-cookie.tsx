import { PreviewSuspense } from '@sanity/preview-kit'
import Container from 'app/Container'
import { Footer, FooterProps, query as footerQuery } from 'app/Footer'
import PreviewButton from 'app/PreviewButton'
import { createClient } from 'app/sanity.client'
import {
  type TableProps,
  query as tableQuery,
  Table,
  TableFallback,
} from 'app/Table'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { lazy } from 'react'

const PreviewTable = lazy(() => import('pages-extra/PreviewTable'))
const PreviewFooter = lazy(() => import('pages-extra/PreviewFooter'))

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
        <PreviewSuspense
          fallback={
            <>
              <TableFallback rows={footerData} />
              <Footer data={footerData} />
            </>
          }
        >
          <PreviewTable token={null} />
          <PreviewFooter token={null} />
        </PreviewSuspense>
      ) : (
        <>
          <Table data={tableData} />
          <Footer data={footerData} />
        </>
      )}
    </Container>
  )
}
