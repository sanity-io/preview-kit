import Container from 'apps/next/components/Container'

export default function VariantTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <Container>{children}</Container>
}
