import { previewSlug } from 'app/config'
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = { runtime: 'nodejs' }

export default function exit(req: NextApiRequest, res: NextApiResponse): void {
  const slug = previewSlug(req.query.slug as any)
  res.clearPreviewData({ path: `/${slug}` })
  res.writeHead(307, { Location: `/${slug}` })
  res.end()
}
