import { previewSlug } from 'apps/next/app/config'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function preview(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  // eslint-disable-next-line no-process-env
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }

  const slug = previewSlug(req.query.slug as any)
  res.setPreviewData({ token }, { path: `/${slug}` })
  res.writeHead(307, { Location: `/${slug}` })
  res.end()
}
