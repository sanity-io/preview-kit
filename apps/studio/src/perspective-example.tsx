import {EyeOpenIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Stack, Text, Code, Heading} from '@sanity/ui'
import {useState, useMemo} from 'react'
import {definePlugin, useClient} from 'sanity'
import {useGlobalPerspective} from 'sanity'
import {route} from 'sanity/router'
import {LiveQueryProvider, useLiveQuery} from '@sanity/preview-kit'
import groq from 'groq'
import type {ClientPerspective} from '@sanity/client'

/**
 * Example tool that demonstrates using useLiveQuery with different perspectives,
 * including integration with Sanity's useGlobalPerspective hook
 */
export const perspectiveExampleTool = definePlugin<void>(() => {
  return {
    name: '@sanity/preview-kit/perspective-example',
    tools: [
      {
        name: 'perspective-example',
        title: 'Perspective Example',
        icon: EyeOpenIcon,
        component: PerspectiveExample,
        router: route.create('/*'),
      },
    ],
  }
})

function PerspectiveExample() {
  const client = useClient({apiVersion: '2025-03-04'})
  const [token] = useState(() => {
    // In a real app, you'd get this from your environment or auth flow
    // For this example, we'll use an empty token (will work with public datasets)
    return ''
  })

  // Get the global perspective from Sanity Studio
  const {value: globalPerspective, loading: perspectiveLoading} = useGlobalPerspective()

  return (
    <LiveQueryProvider client={client} token={token} perspective="drafts">
      <Box padding={4} height="fill">
        <Stack space={5}>
          <Card padding={4} shadow={1} radius={2}>
            <Stack space={3}>
              <Heading size={2}>Perspective Example with useLiveQuery</Heading>
              <Text>
                This example demonstrates how to use <Code>useLiveQuery</Code> with different
                perspectives. Each query can control its own perspective independently from the{' '}
                <Code>LiveQueryProvider</Code>.
              </Text>
              <Text size={1} muted>
                Global Studio Perspective:{' '}
                <Code>{perspectiveLoading ? 'loading...' : globalPerspective}</Code>
              </Text>
            </Stack>
          </Card>

          <Stack space={4}>
            <Heading size={1}>Fixed Perspectives</Heading>
            <Text size={1}>
              These queries use hardcoded perspectives, regardless of the global perspective:
            </Text>
            <PerspectiveQuery perspective="drafts" title="Drafts (Fixed)" />
            <PerspectiveQuery perspective="published" title="Published (Fixed)" />

            <Heading size={1}>Dynamic Global Perspective</Heading>
            <Text size={1}>
              This query uses the global Studio perspective from <Code>useGlobalPerspective</Code>:
            </Text>
            {!perspectiveLoading && globalPerspective !== 'raw' && (
              <PerspectiveQuery
                perspective={globalPerspective as Exclude<ClientPerspective, 'raw'>}
                title={`Global (${globalPerspective})`}
              />
            )}
          </Stack>
        </Stack>
      </Box>
    </LiveQueryProvider>
  )
}

interface PerspectiveQueryProps {
  perspective: Exclude<ClientPerspective, 'raw'>
  title: string
}

function PerspectiveQuery({perspective, title}: PerspectiveQueryProps) {
  const query = groq`count(*[_type == "page"])`

  // Fetch initial data for SSR/hydration
  const [initialData] = useState<number | null>(null)

  const [data, loading, enabled] = useLiveQuery(initialData, query, {}, {perspective})

  return (
    <Card
      padding={4}
      shadow={1}
      radius={2}
      tone={perspective === 'drafts' ? 'caution' : 'positive'}
    >
      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Heading size={1}>{title}</Heading>
          <Box>
            {loading && <Text size={1}>Loading...</Text>}
            {enabled && !loading && (
              <Text size={1} muted>
                ✓ Live
              </Text>
            )}
            {!enabled && (
              <Text size={1} muted>
                Not live
              </Text>
            )}
          </Box>
        </Flex>
        <Card padding={3} tone="transparent" border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Query:
            </Text>
            <Code size={1}>{query}</Code>
          </Stack>
        </Card>
        <Card padding={3} tone="transparent" border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Perspective:
            </Text>
            <Code size={1}>{perspective}</Code>
          </Stack>
        </Card>
        <Card padding={3} tone="primary" border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Result:
            </Text>
            <Text size={2}>{data !== null ? `${data} pages` : 'No data yet'}</Text>
          </Stack>
        </Card>
      </Stack>
    </Card>
  )
}
