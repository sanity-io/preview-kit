import type { NextApiRequest, NextApiResponse } from 'next'

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await res.revalidate('/')
  res.writeHead(307, { Location: '/' })
  res.end()
}
