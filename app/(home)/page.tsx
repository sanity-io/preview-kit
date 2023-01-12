import Link from 'next/link'

const links = [
  ['Create React App', 'https://preview-kit-cra.sanity.build'],
  ['Next 12 - cookie', '/next12-cookie'],
  ['Next 12 - token', '/next12-token'],
  ['Next 13 - cookie', '/next13-cookie'],
  ['Next 13 - token', '/next13-token'],
  ['Remix - cookie', 'https://preview-kit-remix.sanity.build/remix-cookie'],
  ['Remix - token', 'https://preview-kit-remix.sanity.build/remix-token'],
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
