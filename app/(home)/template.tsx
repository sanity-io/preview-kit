import Container from '../Container'

export default function HomeTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <Container back={false}>{children}</Container>
}
