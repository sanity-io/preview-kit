import Link from 'next/link'

const links = [
  ['Next 12 - cookie', '/next12-cookie'],
  ['Next 12 - token', '/next12-token'],
  ['Next 12 - hydration', '/next12-hydration'],
  ['Next 13 - cookie', '/next13-cookie'],
  ['Next 13 - token', '/next13-token'],
  ['Next 13 - hydration', '/next13-hydration'],
  ['Remix - cookie', 'https://preview-kit-remix.sanity.build/remix-cookie'],
  ['Remix - token', 'https://preview-kit-remix.sanity.build/remix-token'],
  [
    'Remix - hydration',
    'https://preview-kit-remix.sanity.build/remix-hydration',
  ],
]
// eslint-disable-next-line no-warning-comments
// @TODO investigate why the Edge runtime routes fail in production
// eslint-disable-next-line no-process-env
if (process.env.VERCEL_ENV !== 'production') {
  links.push(
    ['Edge - cookie', '/next13-cookie-edge'],
    ['Edge - token', '/next13-token-edge']
  )
}

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
