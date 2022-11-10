import type { NextApiRequest, NextApiResponse } from 'next'

export default function preview(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  res.setPreviewData({}, { path: '/next13-cookie' })
  res.writeHead(307, { Location: '/next13-cookie' })
  res.end()
}
