import type { NextApiRequest, NextApiResponse } from 'next'

export default function exitPreview(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  res.setDraftMode({ enable: false })
  res.writeHead(307, { Location: '/' })
  res.end()
}
