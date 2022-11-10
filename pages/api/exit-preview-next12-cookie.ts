import type { NextApiRequest, NextApiResponse } from 'next'

export default function exit(_req: NextApiRequest, res: NextApiResponse): void {
  res.clearPreviewData({ path: '/next12-cookie' })
  res.writeHead(307, { Location: '/next12-cookie' })
  res.end()
}
