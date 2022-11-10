import Container from '../Container'

export default function VariantTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <Container>{children}</Container>
}
