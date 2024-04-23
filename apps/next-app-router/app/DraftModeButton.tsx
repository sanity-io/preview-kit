import {draftMode} from 'next/headers'
import {PreviewDraftsButton, ViewPublishedButton} from 'ui/react'

export default function DraftModeButton() {
  return (
    <form style={{display: 'contents'}}>
      {draftMode().isEnabled ? (
        <ViewPublishedButton formAction="/api/disable-draft" />
      ) : (
        <PreviewDraftsButton formAction="/api/draft" />
      )}
    </form>
  )
}
