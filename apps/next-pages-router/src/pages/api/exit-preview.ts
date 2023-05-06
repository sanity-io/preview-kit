import type { NextApiRequest, NextApiResponse } from 'next'

export default function exitPreview(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  res.clearPreviewData({})
  res.writeHead(307, { Location: '/' })
  res.end()
}
