import PreviewButton from 'apps/next/app/PreviewButton'
import PreviewTemplate from 'apps/next/app/PreviewTemplate'
import { createClient } from 'apps/next/app/sanity.client'
import Container from 'apps/next/components/Container'
import {
  type FooterProps,
  query as footerQuery,
} from 'apps/next/components/Footer'
import PageTemplate from 'apps/next/components/PageTemplate'
import {
  query as tableQuery,
  type TableProps,
} from 'apps/next/components/Table'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'

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
        start="/api/preview?slug=next12-token"
        stop="/api/exit-preview?slug=next12-token"
      />
      {preview && token ? (
        <PreviewTemplate token={token} footerData={footerData} />
      ) : (
        <PageTemplate tableData={tableData} footerData={footerData} />
      )}
    </Container>
  )
}
