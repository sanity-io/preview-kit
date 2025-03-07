/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getVersionFromId } from '@sanity/client/csm'
import { vercelStegaSplit } from '@vercel/stega'
import groq from 'groq'
import { q } from 'groqd'
import { memo } from 'react'

export function Button({
  children,
  disabled,
  isLoading,
  formAction,
}: {
  children?: React.ReactNode
  disabled?: boolean
  isLoading?: boolean
  formAction?: React.JSX.IntrinsicElements['button']['formAction']
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      formAction={formAction}
      className={`button is-light ${isLoading ? 'is-loading' : ''}`}
    >
      {children}
    </button>
  )
}
export function PreviewDraftsButton({
  isLoading,
  formAction,
}: {
  isLoading?: boolean
  formAction?: React.JSX.IntrinsicElements['button']['formAction']
}) {
  return (
    <section className="section">
      <Button isLoading={isLoading} formAction={formAction}>
        Preview Drafts
      </Button>
    </section>
  )
}

export function ViewPublishedButton({
  isLoading,
  formAction,
}: {
  isLoading?: boolean
  formAction?: React.JSX.IntrinsicElements['button']['formAction']
}) {
  return (
    <section className="section">
      <Button isLoading={isLoading} formAction={formAction}>
        View Published
      </Button>
    </section>
  )
}

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <main className="container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </main>
  )
}

const { query: tableQuery, schema: tableSchema } = q('*')
  .filter("_type == 'page'")
  .grab({
    _id: q.string(),
    _originalId: q.string().nullish(),
    _createdAt: q.string().optional(),
    _updatedAt: q.string().optional(),
    title: q.string().optional(),
    status: q.select({
      '_originalId in path("versions.**")': [
        '"in release"',
        q.literal('in release'),
      ],
      '_originalId in path("drafts.**")': ['"draft"', q.literal('draft')],
      default: ['"published"', q.literal('published')],
    }),
  })
  .order('title asc')
  .slice(0, 9)
export { tableQuery }

export type TableProps = {
  data: unknown
}

const thead = (
  <thead>
    <tr>
      <th>title</th>
      <th style={{ width: '1%' }}>status</th>
      <th style={{ width: '1%' }}>_updatedAt</th>
    </tr>
  </thead>
)

export function _Table(props: TableProps) {
  const data = tableSchema.parse(props.data || [])
  return (
    <div className="table-container is-flex-shrink-0" style={{ width: '100%' }}>
      <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        {thead}
        <tbody>
          {data.map((type) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { cleaned, encoded } = vercelStegaSplit(type._updatedAt!)
            const date = new Date(cleaned)
            return (
              <tr
                key={type._id}
                data-created-at={type._createdAt}
                data-original-id={type._originalId}
                data-id={type._id}
              >
                <td width={300}>{type.title}</td>
                <td style={{ whiteSpace: 'nowrap' }} width={300}>
                  {type.status === 'in release' && type._originalId
                    ? getVersionFromId(type._originalId)
                    : type.status}
                </td>
                <td style={{ whiteSpace: 'nowrap' }} width={300}>
                  <time dateTime={type._updatedAt}>
                    {`${date.getUTCHours().toString().padStart(2, '0')}:${date
                      .getUTCMinutes()
                      .toString()
                      .padStart(2, '0')}:${date
                      .getUTCSeconds()
                      .toString()
                      .padStart(2, '0')}`}
                    {encoded}
                  </time>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
_Table.displayName = 'Table'
export const Table = memo(_Table)

// @OTOD rewrite to use groqd, and pagination like footerQuery
export const tableFallbackQuery = groq`count(*[_type == 'page'] | order(_updatedAt desc) [0...10])`
export const TableFallback = memo(function TableFallback({
  rows,
}: {
  rows: number
}) {
  const trs = Array(rows).fill('')

  return (
    <div className="table-container is-flex-shrink-0" style={{ width: '100%' }}>
      <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        {thead}
        <tbody>
          {trs.map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={`${i}`}>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                Loading…
              </td>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                &nbsp;
              </td>
              <td style={{ whiteSpace: 'nowrap' }} width={300}>
                &nbsp;
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

export const footerQuery = groq`count(*[_type == 'page'])`

export type FooterProps = {
  data: number
}

export function _Footer({ data }: FooterProps) {
  return (
    <span className="tag is-light">
      Documents:{' '}
      <span className="pl-1 has-text-weight-bold">
        {new Intl.NumberFormat('en-US').format(data)}
      </span>
    </span>
  )
}
_Footer.displayName = 'Footer'
export const Footer = memo(_Footer)

export function Timestamp(props: { date: Date | string }) {
  const date =
    typeof props.date === 'string' ? new Date(props.date) : props.date
  return (
    <time dateTime={date?.toJSON?.()}>
      {date.getUTCHours().toString().padStart(2, '0')}:
      {date.getUTCMinutes().toString().padStart(2, '0')}:
      {date.getUTCSeconds().toString().padStart(2, '0')}
    </time>
  )
}
