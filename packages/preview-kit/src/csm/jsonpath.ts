import type { PathSegment } from '@sanity/client/csm'

const UNESCAPE: Record<string, string> = {
  '\\f': '\f',
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t',
  "\\'": "'",
  '\\\\': '\\',
}

/** @internal */
export function parseJsonPath(path: string): PathSegment[] {
  const parsed: PathSegment[] = []

  const parseRe = /\['(.*?)'\]|\[(\d+)\]|\[\?\(@\._key=='(.*?)'\)\]/g
  let match: RegExpExecArray | null

  while ((match = parseRe.exec(path)) !== null) {
    if (match[1] !== undefined) {
      const key = match[1].replace(/\\(\\|f|n|r|t|')/g, (m) => {
        return UNESCAPE[m]
      })

      parsed.push(key)
      continue
    }

    if (match[2] !== undefined) {
      parsed.push(parseInt(match[2], 10))
      continue
    }

    if (match[3] !== undefined) {
      const key = match[3].replace(/\\(\\')/g, (m) => {
        return UNESCAPE[m]
      })

      parsed.push({
        key,
        index: -1,
      })
      continue
    }
  }

  return parsed
}
