import {Box, Card, Flex, Stack, Text, Code, Heading} from '@sanity/ui'
import {useClient, usePerspective} from 'sanity'
import {LiveQueryProvider, useLiveQuery} from '@sanity/preview-kit'
import groq from 'groq'
import type {ClientPerspective} from '@sanity/client'

/**
 * Example view that demonstrates using useLiveQuery with different perspectives,
 * including integration with Sanity's usePerspective hook
 */
export function PerspectiveExample() {
  const client = useClient({apiVersion: '2025-03-04'})
  const {perspectiveStack} = usePerspective()

  return (
    <LiveQueryProvider client={client} perspective={perspectiveStack}>
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
                Global Studio Perspective: <Code>{JSON.stringify(perspectiveStack)}</Code>
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
              This query uses the global Studio perspective from <Code>usePerspective</Code>:
            </Text>
            <PerspectiveQuery
              perspective={perspectiveStack}
              title={`Global (${perspectiveStack})`}
            />
            <Heading size={1}>Provider Default Perspective</Heading>
            <Text size={1}>
              This query doesn't specify a perspective, so it uses the provider's default:
            </Text>
            <PerspectiveQueryNoOption title="Provider Default" />
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
  const query = groq`*[_type == "page"][0..20]`

  const [data, loading, enabled] = useLiveQuery(null, query, {}, {perspective})

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
            <Code size={1}>{JSON.stringify(data, null, 2)}</Code>
          </Stack>
        </Card>
      </Stack>
    </Card>
  )
}

interface PerspectiveQueryNoOptionProps {
  title: string
}

function PerspectiveQueryNoOption({title}: PerspectiveQueryNoOptionProps) {
  const query = groq`*[_type == "page"][0..20]`

  const [data, loading, enabled] = useLiveQuery(null, query, {})

  return (
    <Card padding={4} shadow={1} radius={2} tone="default">
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
            <Code size={1}>(uses provider default)</Code>
          </Stack>
        </Card>
        <Card padding={3} tone="primary" border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Result:
            </Text>
            <Code size={1}>{JSON.stringify(data, null, 2)}</Code>
          </Stack>
        </Card>
      </Stack>
    </Card>
  )
}
