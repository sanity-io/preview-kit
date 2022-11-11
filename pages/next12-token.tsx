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

const PreviewTable = lazy(() => import('pages-extra/PreviewTable'))

export const getStaticProps: GetStaticProps<{
  preview: boolean
  token?: string
  tableData: TableProps['data']
  footerData: unknown
}> = async ({ preview = false, previewData = {} }) => {
  const revalidate = 60

  if (preview) {
    return {
      props: {
        preview,
        token: (previewData as any)?.token,
        tableData: [],
        footerData: null,
      },
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

export default function Next12TokenPage({
  preview,
  token,
  tableData,
  footerData,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // eslint-disable-next-line no-console
  console.log('Next12TokenPage', { preview, token, footerData })
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
              <TableFallback />
            </>
          }
        >
          <PreviewTable token={token} />
        </PreviewSuspense>
      ) : (
        <>
          <Table data={tableData} />
        </>
      )}
    </Container>
  )
}
