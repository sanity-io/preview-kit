import type { UsePreview } from '@sanity/preview-kit'
import { usePreview as _usePreview } from 'app/sanity.preview'
import { Footer, type FooterProps, query } from 'app/components/Footer'

const usePreview: UsePreview<FooterProps['data']> = _usePreview

export default function PreviewFooter({ token }: { token: string | null }) {
  const data = usePreview(token, query)
  return <Footer data={data ?? 0} />
}
