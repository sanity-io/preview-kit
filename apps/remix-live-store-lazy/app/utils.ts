import { createClient } from '@sanity/preview-kit/client'

export function getClient(
  preview: boolean,
  {
    projectId,
    dataset,
    apiVersion,
    useCdn,
    token,
  }: Pick<
    Parameters<typeof createClient>[0],
    'projectId' | 'dataset' | 'apiVersion' | 'useCdn' | 'token'
  >
) {
  const sanityClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    studioUrl: 'https://preview-kit-test-studio.sanity.build/',
    encodeSourceMap: true,
    encodeSourceMapAtPath: () => true,
    perspective: 'published',
    token,
  })

  if (preview) {
    // Used to preview drafts as they will appear once published
    return sanityClient.withConfig({
      ignoreBrowserTokenWarning: true,
      perspective: 'previewDrafts',
      // required by previewDrafts
      useCdn: false,
    })
  }

  return sanityClient
}
