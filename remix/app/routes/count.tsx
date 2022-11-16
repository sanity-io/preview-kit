import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import createClient from '@sanity/client'
import type { UsePreview } from '@sanity/preview-kit'
import { definePreview, PreviewSuspense } from '@sanity/preview-kit'
import groq from 'groq'
import { useReducer } from 'react'

const projectId = 'pv8y60vp'
const dataset = 'production'

const query = groq`count(*[])`

export const loader = async () => {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2022-11-15',
    useCdn: true,
  })

  return json({ data: await client.fetch<number>(query) })
}

export default function CountPage() {
  const { data } = useLoaderData<typeof loader>()
  const [preview, toggle] = useReducer((state) => !state, false)

  return (
    <>
      <button type="button" onClick={toggle}>
        {preview ? 'Stop preview' : 'Start preview'}
      </button>
      {preview ? (
        <PreviewSuspense fallback={<Count data={data} />}>
          <PreviewCount />
        </PreviewSuspense>
      ) : (
        <Count data={data} />
      )}
    </>
  )
}

const Count = ({ data }: { data: number }) => (
  <>
    Documents: <strong>{data}</strong>
  </>
)

const usePreview: UsePreview<number> = definePreview({
  projectId,
  dataset,
  onPublicAccessOnly: () =>
    alert('You are not logged in. You will only see public data.'),
})
const PreviewCount = () => {
  const data = usePreview(null, query)
  return <Count data={data!} />
}
