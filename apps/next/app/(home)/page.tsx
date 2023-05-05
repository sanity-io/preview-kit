import Link from 'next/link'

const links = [
  ['Node - cookie', '/cookie'],
  ['Node - token', '/token'],
  ['Node - hydration', '/hydration'],
]

links.sort((a, b) => a[0].localeCompare(b[0]))

export default function IndexPage() {
  return (
    <div className="columns is-multiline is-mobile">
      {links.map(([label, href]) => (
        <div className="column" key={href}>
          <Link href={href} className="button is-block is-link is-light">
            {label}
          </Link>
        </div>
      ))}
    </div>
  )
}
