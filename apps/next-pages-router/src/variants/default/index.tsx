import type { InferGetStaticPropsType } from 'next'
import { getStaticProps } from '../../pages'

export default function DefaultVariant({
  children,
}: InferGetStaticPropsType<typeof getStaticProps> & React.PropsWithChildren) {
  return children
}
