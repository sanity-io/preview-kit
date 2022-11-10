import Container from 'app/Container'
import PreviewButton from 'app/PreviewButton'
import type { GetStaticProps } from 'next'

export default function Next12TokenPage({
  preview,
  token,
}: {
  preview?: boolean
  token?: string
}) {
  // eslint-disable-next-line no-console
  console.log('Next12TokenPage', { preview, token })
  return (
    <Container>
      <PreviewButton
        preview={!!preview}
        start="/api/preview-next12-token"
        stop="/api/exit-preview-next12-token"
      />
    </Container>
  )
}

export const getStaticProps: GetStaticProps<any, any, any> = ({
  preview = false,
  previewData = {},
}) => {
  return {
    props: {
      preview,
      token: previewData?.token || null,
    },
    revalidate: 60,
  }
}
