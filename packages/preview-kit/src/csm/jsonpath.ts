import type { PathSegment } from './types'

const ESCAPE: Record<string, string> = {
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  "'": "\\'",
  '\\': '\\\\',
}

const UNESCAPE: Record<string, string> = {
  '\\f': '\f',
  '\\n': '\n',
  '\\r': '\r',
  '\\t': '\t',
  "\\'": "'",
  '\\\\': '\\',
}

/** @internal */
export function normalisedJsonPath(path: PathSegment[]): string {
  return `$${path
    .map((key) => {
      if (typeof key === 'string') {
        const escapedKey = key.replace(/[\f\n\r\t'\\]/g, (match) => {
          return ESCAPE[match]
        })
        return `['${escapedKey}']`
      }

      return `[${key}]`
    })
    .join('')}`
}

/** @internal */
export function parseNormalisedJsonPath(path: string): PathSegment[] {
  const parsed: PathSegment[] = []

  const parseRe = /\['(.*?)'\]|\[(\d+)\]/g
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
  }

  return parsed
}
