import type {NextApiRequest, NextApiResponse} from 'next'

export default function preview(req: NextApiRequest, res: NextApiResponse): void {
  res.setDraftMode({enable: true})
  res.writeHead(307, {Location: '/'})
  res.end()
}
