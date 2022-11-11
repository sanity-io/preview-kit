import { PreviewSuspense } from '@sanity/preview-kit'
import Container from 'app/Container'
import { type FooterProps, Footer, query as footerQuery } from 'app/Footer'
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
  token?: string
  tableData: TableProps['data']
  footerData: FooterProps['data']
}> = async ({ preview = false, previewData = {} }) => {
  const revalidate = 60

  if (preview) {
    const token = (previewData as any)?.token
    const client = createClient().withConfig({ token })

    return {
      props: {
        preview,
        token,
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

export default function Next12TokenPage({
  preview,
  token,
  tableData,
  footerData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      <PreviewButton
        preview={!!preview && !!token}
        start="/api/preview-next12-token"
        stop="/api/exit-preview-next12-token"
      />
      {preview && token ? (
        <PreviewSuspense
          fallback={
            <>
              <TableFallback rows={footerData} />
              <Footer data={footerData} />
            </>
          }
        >
          <PreviewTable token={token} />
          <PreviewFooter token={token} />
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
