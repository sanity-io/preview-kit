import Container from 'components/Container'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { createClient } from '@sanity/preview-kit/client'
import type { UsePreview } from '@sanity/preview-kit'
import { definePreview, PreviewSuspense } from '@sanity/preview-kit'
import groq from 'groq'
import { useReducer } from 'react'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = groq`count(array::unique(
  *[_type == 'page']{"_id": select(
    _id in path("drafts.**") => _id,
    "drafts." + _id
  )}._id
))
`

export const loader = async () => {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2023-05-03',
    useCdn: true,
  })
  const previewClient = client.withConfig({
    token: process.env.SANITY_API_READ_TOKEN,
  })

  return json({
    data: await client.fetch<number>(query),
    previewData: await previewClient.fetch<number>(query),
  })
}

export default function CountPage() {
  const { data, previewData } = useLoaderData<typeof loader>()
  const [preview, toggle] = useReducer((state) => !state, true)

  return (
    <Container>
      <section className="section">
        <button
          className={`button is-light ${preview ? 'is-danger' : 'is-success'}`}
          type="button"
          onClick={toggle}
        >
          {preview ? 'Stop preview' : 'Start preview'}
        </button>
      </section>
      {preview ? (
        <PreviewSuspense fallback={<Count data={previewData} />}>
          <PreviewCount previewData={previewData} />
        </PreviewSuspense>
      ) : (
        <Count data={data} />
      )}
    </Container>
  )
}

const Count = ({ data }: { data: number }) => (
  <span className="tag is-light">
    Documents: <span className="pl-1 has-text-weight-bold">{data}</span>
  </span>
)

const usePreview: UsePreview<number> = definePreview({
  projectId,
  dataset,
  // Disabled since we handle drafts in the GROQ itself
  overlayDrafts: false,
})
const PreviewCount = ({ previewData }: { previewData: number }) => {
  const data = usePreview(null, query, null, previewData)
  return <Count data={data!} />
}
