import Container from 'app/Container'
import PreviewButton from 'app/PreviewButton'
import type { GetStaticProps } from 'next'

export default function Next12CookiePage({
  preview,
  ...props
}: {
  preview?: boolean
}) {
  // eslint-disable-next-line no-console
  console.log('Next12CookiePage', { preview, props })
  return (
    <Container>
      <PreviewButton
        preview={!!preview}
        start="/api/preview-next12-cookie"
        stop="/api/exit-preview-next12-cookie"
      />
    </Container>
  )
}

export const getStaticProps: GetStaticProps<any, any, any> = ({
  preview = false,
}) => {
  return {
    props: {
      preview,
    },
    revalidate: 60,
  }
}
