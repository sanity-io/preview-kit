import Container from 'app/Container'
import { type FooterProps, Footer, query as footerQuery } from 'app/Footer'
import PreviewButton from 'app/PreviewButton'
import PreviewFooter from 'app/PreviewFooter'
import { PreviewSuspense } from 'app/PreviewSuspense'
import PreviewTable from 'app/PreviewTable'
import {
  type TableProps,
  query as tableQuery,
  Table,
  TableFallback,
} from 'app/Table'
import { createClient } from 'app/utils'

export default async function Next13CookiePage() {
  const preview = false

  const button = (
    <PreviewButton
      preview={!!preview}
      start="/api/preview-next13-cookie"
      stop="/api/exit-preview-next13-cookie"
    />
  )

  if (preview) {
    // eslint-disable-next-line no-process-env
    const client = createClient(process.env.SANITY_API_READ_TOKEN)
    const footerData = await client.fetch<FooterProps['data']>(footerQuery)

    return (
      <Container>
        {button}
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
      </Container>
    )
  }

  const client = createClient()
  const tablePromise = client.fetch<TableProps['data']>(tableQuery)
  const footerPromise = client.fetch<FooterProps['data']>(footerQuery)
  return (
    <Container>
      {button}
      <Table data={await tablePromise} />
      <Footer data={await footerPromise} />
    </Container>
  )
}

export const revalidate = 60
