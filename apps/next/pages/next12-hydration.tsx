import { PreviewSuspense } from '@sanity/preview-kit'
import { Count, type CountProps, query } from 'apps/next/app/Count'
import PreviewButton from 'apps/next/app/PreviewButton'
import PreviewCount from 'apps/next/app/PreviewCount'
import { createClient } from 'apps/next/app/sanity.client'
import Container from 'apps/next/components/Container'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'

export const getStaticProps: GetStaticProps<{
  preview: boolean
  token?: string
  data: CountProps['data']
}> = async ({ preview = false, previewData = {} }) => {
  const revalidate = 60

  if (preview) {
    const token = (previewData as any)?.token
    const client = createClient().withConfig({ token })

    return {
      props: {
        preview,
        token,
        data: await client.fetch(query),
      },
      revalidate,
    }
  }

  const client = createClient()

  return {
    props: {
      preview,
      data: await client.fetch(query),
    },
    revalidate,
  }
}

export default function Next12HydrationPage({
  preview,
  token,
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Container>
      <PreviewButton
        preview={!!preview && !!token}
        start="/api/preview?slug=next12-hydration"
        stop="/api/exit-preview?slug=next12-hydration"
      />
      {preview && token ? (
        <PreviewSuspense fallback={<Count data={data} />}>
          <PreviewCount initialData={data} />
        </PreviewSuspense>
      ) : (
        <Count data={data} />
      )}
    </Container>
  )
}
