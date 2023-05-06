import { faker } from '@faker-js/faker'
import { ActivityIcon } from '@sanity/icons'
import { Box, Button, Stack, Text } from '@sanity/ui'
import { useState } from 'react'
import { SanityClient, definePlugin, useClient } from 'sanity'
import { route } from 'sanity/router'
import styled from 'styled-components'
import groq from 'groq'

/**
 * Benchmark tool that can batch create, edit, and delete, documents for testing how well the live preview experiences can handle the pressure
 */
export const benchmarkTool = definePlugin<void>(() => {
  return {
    name: '@sanity/preview-kit/benchmark',
    tools: [
      {
        name: 'benchmark',
        title: 'Benchmark',
        icon: ActivityIcon,
        component: Benchmark,
        router: route.create('/*'),
      },
    ],
  }
})

const Container = styled(Box)`
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

function Benchmark() {
  const client = useClient({ apiVersion: '2023-05-05' })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<unknown>(null)

  if (error) throw error

  return (
    <Container sizing="border" display="flex">
      <Stack space={5}>
        <Box padding={4}>
          <Stack space={4} style={{ justifyItems: 'center' }}>
            <Text>
              Quickly fill up the dataset with documents to test live preview
              experiences at scale.
            </Text>
            <Box style={{ justifyItems: 'center' }}>
              <Button
                tone="positive"
                loading={creating}
                onClick={(event) => {
                  setCreating(true)
                  createDocuments(client, 1000)
                    .catch(setError)
                    .finally(() => setCreating(false))
                }}
              >
                Create 1k pages
              </Button>
              <span style={{ display: 'inline-block', width: '1rem' }} />
              <Button
                tone="positive"
                loading={creating}
                onClick={(event) => {
                  setCreating(true)
                  createDocuments(client, 10000)
                    .catch(setError)
                    .finally(() => setEditing(false))
                }}
              >
                Create 10k pages
              </Button>
            </Box>
          </Stack>
        </Box>
        <Box padding={4}>
          <Stack space={4} style={{ justifyItems: 'center' }}>
            <Text>
              Simulate editing activity. You can also start this as a GitHub
              Action to scale up the load and avoid hitting API rate limits from
              your own IP address.
            </Text>
            <Box style={{ justifyItems: 'center' }}>
              <Button
                tone="caution"
                loading={editing}
                onClick={(event) => {
                  setEditing(true)
                  updateDocuments(client, 15, 10)
                    .catch(setError)
                    .finally(() => setEditing(false))
                }}
              >
                Edit pages for 15 minutes
              </Button>
            </Box>
          </Stack>
        </Box>
        <Box padding={4}>
          <Stack space={4} style={{ justifyItems: 'center' }}>
            <Text>
              Remove all documents that aren't drafts, to quickly remove
              benchmark pages
            </Text>
            <Box style={{ justifyItems: 'center' }}>
              <Button
                tone="critical"
                loading={deleting}
                onClick={(event) => {
                  setDeleting(true)
                  deleteDocuments(client)
                    .catch(setError)
                    .finally(() => setDeleting(false))
                }}
              >
                Delete all published pages
              </Button>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}

async function createDocuments(client: SanityClient, amount: number) {
  const iterations = Math.max(1, Math.round(amount / 100))
  for (let i = 1; i <= iterations; i++) {
    const transaction = client.transaction()
    for (let i = 1; i <= 100; i++) {
      transaction.create({ _type: 'page', title: generateNewTitle() })
    }
    await transaction.commit({ visibility: 'async' })
  }
}
export async function updateDocuments(
  client: SanityClient,
  minutes: number,
  batch: number
) {
  const start = Date.now()
  const end = start + minutes * 60 * 1000

  while (Date.now() < end) {
    const transaction = client.transaction()
    const ids = await client.fetch(
      groq`*[_type == "page" && !(_id in path("drafts.**"))] | order(title asc)[1..${
        batch + 1
      }]._id`
    )
    for (const documentId of ids) {
      transaction.patch(documentId, (p) => p.set({ title: generateNewTitle() }))
    }
    await transaction.commit({ visibility: 'async' })
  }
}
async function deleteDocuments(client: SanityClient) {
  // const count = await client.fetch('*[!(_id in path("drafts.**"))]._id')
  const count = await client.fetch(
    groq`count(*[_type == "page" && !(_id in path("drafts.**"))])`
  )

  const batch = 1000
  const iterations = Math.max(1, Math.round(count / batch))
  for (let i = 1; i <= iterations; i++) {
    await client.delete({
      query: groq`*[_type == "page" && !(_id in path("drafts.**"))][0..${batch}]`,
    })
  }
}

function generateNewTitle() {
  return `${faker.commerce.productName()} ${faker.internet.emoji()}`
}
