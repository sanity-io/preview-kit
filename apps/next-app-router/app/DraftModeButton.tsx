import {draftMode} from 'next/headers'
import {PreviewDraftsButton, ViewPublishedButton} from 'ui/react'

export default async function DraftModeButton() {
  const {isEnabled} = await draftMode()
  return (
    <form style={{display: 'contents'}}>
      {isEnabled ? (
        <ViewPublishedButton formAction="/api/disable-draft" />
      ) : (
        <PreviewDraftsButton formAction="/api/draft" />
      )}
    </form>
  )
}
