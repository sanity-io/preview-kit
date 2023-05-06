import { LiveContentProvider } from 'app/previews'
import Container from 'components/Container'
import { draftMode } from 'next/headers'

export default function VariantTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  if (draftMode().isEnabled) {
    return (
      <Container>
        <LiveContentProvider token={process.env.SANITY_API_READ_TOKEN || null}>
          {children}
        </LiveContentProvider>
      </Container>
    )
  }

  return <Container>{children}</Container>
}
