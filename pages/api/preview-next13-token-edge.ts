import type { NextApiRequest, NextApiResponse } from 'next'

export default function preview(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  // eslint-disable-next-line no-process-env
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    throw new TypeError(`Missing SANITY_API_READ_TOKEN`)
  }

  res.setPreviewData({ token }, { path: '/next13-token-edge' })
  res.writeHead(307, { Location: '/next13-token-edge' })
  res.end()
}
