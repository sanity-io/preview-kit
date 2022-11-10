import Link from 'next/link'

const links = [
  ['Next 12 - cookie', '/next12-cookie'],
  ['Next 12 - token', '/next12-token'],
  ['Next 13 - cookie', '/next13-cookie'],
  ['Next 13 - token', '/next13-token'],
  ['Edge - cookie', '/next13-cookie-edge'],
  ['Edge - token', '/next13-token-edge'],
]

export default function IndexPage() {
  return (
    <div className="columns">
      {links.map(([label, href]) => (
        <div className="column" key={href}>
          <Link href={href} className="button is-link is-light">
            {label}
          </Link>
        </div>
      ))}
    </div>
  )
}
