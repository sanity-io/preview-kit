import {
  unstable__adapter as adapter,
  unstable__environment as environment,
} from '@sanity/client'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { FooterProps, TableProps, footerQuery, tableQuery } from 'ui/react'
import { getClient } from '../sanity.client'
import DefaultVariant from '../variants/default'
import GroqStoreVariant from '../variants/groq-store'
import LiveStoreVariant from '../variants/live-store'

export const getStaticProps: GetStaticProps<{
  draftMode: boolean
  token: string
  table: TableProps['data']
  footer: FooterProps['data']
  timestamp: string
  server__adapter: typeof adapter
  server__environment: typeof environment
  variant: string
}> = async ({ draftMode = false }) => {
  const token = process.env.SANITY_API_READ_TOKEN!
  const client = getClient(draftMode ? { token } : undefined)
  const [table, footer] = await Promise.all([
    client.fetch(tableQuery),
    client.fetch(footerQuery),
  ])
  const timestamp = new Date().toJSON()

  return {
    props: {
      draftMode,
      token,
      table: await table,
      footer: await footer,
      timestamp,
      server__adapter: adapter,
      server__environment: environment,
      variant: process.env.VARIANT || 'default',
    },
  }
}

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  switch (props.variant) {
    case 'default':
      return <DefaultVariant {...props} />
    case 'groq-store':
      return <GroqStoreVariant {...props} />
    case 'live-store':
      return <LiveStoreVariant {...props} />
    default:
      throw new Error(`Unknown variant: ${props.variant}`)
  }
}
