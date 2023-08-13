import type { SerializeFrom } from '@vercel/remix'
import type { loader } from '~/routes'

export default function DefaultVariant({
  children,
}: SerializeFrom<typeof loader> & React.PropsWithChildren) {
  return children
}
