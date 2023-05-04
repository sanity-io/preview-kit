import PreviewButton from 'app/PreviewButton'
import PreviewTemplate from 'app/PreviewTemplate'
import { createClient } from 'app/sanity.client'
import Container from 'components/Container'
import { type FooterProps, query as footerQuery } from 'components/Footer'
import PageTemplate from 'components/PageTemplate'
import { query as tableQuery, type TableProps } from 'components/Table'
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
