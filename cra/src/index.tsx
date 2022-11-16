/* eslint-disable no-process-env */
import 'bulma/css/bulma.min.css'

import createClient from '@sanity/client'
import { definePreview } from '@sanity/preview-kit'
import groq from 'groq'
import { Suspense, useReducer } from 'react'
import { createRoot } from 'react-dom/client'
import useSWR from 'swr/immutable'

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <main className="container">
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '100svh',
        justifyContent: 'center',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Suspense
        fallback={<span className="tag is-light">Loading&hellip;</span>}
      >
        <App />
      </Suspense>
      <section className="section">
        <a
          href="https://preview-kit.sanity.build/"
          className="button is-light is-link"
        >
          Go back
        </a>
      </section>
    </div>
  </main>
)

const projectId = process.env.REACT_APP_SANITY_PROJECT_ID!
const dataset = process.env.REACT_APP_SANITY_DATASET!
const apiVersion = process.env.REACT_APP_SANITY_API_VERSION!
const client = createClient({ projectId, dataset, apiVersion, useCdn: true })

const query = groq`count(*[_type == 'page'])`

function App() {
  const [preview, toggle] = useReducer((state) => !state, false)

  const button = (
    <section className="section">
      <button
        type="button"
        onClick={toggle}
        className={`button is-light ${preview ? 'is-danger' : 'is-success'}`}
      >
        {preview ? 'Stop preview' : 'Start preview'}
      </button>
    </section>
  )

  const { data } = useSWR<number>(query, (_query) => client.fetch(_query), {
    suspense: true,
  })

  if (preview) {
    return (
      <>
        {button}
        <Suspense fallback={<Count data={data!} />}>
          <PreviewCount />
        </Suspense>
      </>
    )
  }

  return (
    <>
      {button}
      <Count data={data!} />
    </>
  )
}

const Count = ({ data }: { data: number }) => (
  <span className="tag is-light">
    Documents: <span className="pl-1 has-text-weight-bold">{data}</span>
  </span>
)

let alerted = false
const usePreview = definePreview({
  projectId,
  dataset,
  onPublicAccessOnly: () => {
    if (!alerted) {
      // eslint-disable-next-line no-alert
      alert('You are not logged in. You will only see public data.')
      alerted = true
    }
  },
})
const PreviewCount = () => {
  const data = usePreview(null, query)

  return <Count data={data} />
}
