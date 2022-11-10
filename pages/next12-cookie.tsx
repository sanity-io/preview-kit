import Container from 'app/Container'
import type { GetStaticProps } from 'next'

export default function Next12CookiePage({
  preview,
  token,
}: {
  preview?: boolean
  token?: string
}) {
  // eslint-disable-next-line no-console
  console.log('Next12CookiePage', { preview, token })
  return <Container>TODO</Container>
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
