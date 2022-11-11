import { PreviewSuspense } from '@sanity/preview-kit'
import Container from 'app/Container'
import PreviewButton from 'app/PreviewButton'
import {
  type TableProps,
  query as tableQuery,
  Table,
  TableFallback,
} from 'app/Table'
import { createClient } from 'app/utils'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { lazy } from 'react'

const PreviewTable = lazy(() => import('./_PreviewTable'))

export const getStaticProps: GetStaticProps<{
  preview: boolean
  tableData: TableProps['data']
  footerData: unknown
}> = async ({ preview = false }) => {
  const revalidate = 60

  if (preview) {
    return {
      props: { preview, tableData: [], footerData: null },
      revalidate,
    }
  }

  const client = createClient()
  const tablePromise = client.fetch(tableQuery)

  return {
    props: {
      preview,
      tableData: await tablePromise,
      footerData: null,
    },
    revalidate,
  }
}

export default function Next12CookiePage({
  preview,
  tableData,
  footerData,
  ...props
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // eslint-disable-next-line no-console
  console.log('Next12CookiePage', { preview, tableData, footerData, props })
  return (
    <Container>
      <PreviewButton
        preview={!!preview}
        start="/api/preview-next12-cookie"
        stop="/api/exit-preview-next12-cookie"
      />
      {preview ? (
        <PreviewSuspense
          fallback={
            <>
              <TableFallback />
            </>
          }
        >
          <PreviewTable token={null} />
        </PreviewSuspense>
      ) : (
        <>
          <Table data={tableData} />
        </>
      )}
    </Container>
  )
}
