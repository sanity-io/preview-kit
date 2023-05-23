import { createClient } from '@sanity/preview-kit/client'

export function getClient(
  previewDrafts: boolean,
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
  })

  if (previewDrafts) {
    // Used to preview drafts as they will appear once published
    return sanityClient.withConfig({
      perspective: 'previewDrafts',
      // required by previewDrafts
      apiVersion: 'X',
      useCdn: false,
      token,
      ignoreBrowserTokenWarning: true,
    })
  }

  return sanityClient
}
