import 'bulma/css/bulma.min.css'
import { Container } from 'ui/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <Container>{children}</Container>
      </body>
    </html>
  )
}
