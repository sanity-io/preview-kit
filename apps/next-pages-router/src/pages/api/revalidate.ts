import type { NextApiRequest, NextApiResponse } from 'next'

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await res.revalidate('/')
  await new Promise((resolve) => setTimeout(resolve, 2000))
  res.writeHead(307, { Location: '/' })
  res.end()
}
