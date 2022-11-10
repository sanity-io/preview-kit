import type { NextApiRequest, NextApiResponse } from 'next'

export default function exit(_req: NextApiRequest, res: NextApiResponse): void {
  res.clearPreviewData({ path: '/next13-cookie-edge' })
  res.writeHead(307, { Location: '/next13-cookie-edge' })
  res.end()
}
