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
export function jsonPath(
  path: PathSegment[],
  opts?: {
    keyArraySelectors: boolean
  },
): string {
  return `$${path
    .map((segment) => {
      if (typeof segment === 'string') {
        const escapedKey = segment.replace(/[\f\n\r\t'\\]/g, (match) => {
          return ESCAPE[match]
        })
        return `['${escapedKey}']`
      }

      if (typeof segment === 'number') {
        return `[${segment}]`
      }

      if (opts?.keyArraySelectors && segment.key !== '') {
        const escapedKey = segment.key.replace(/['\\]/g, (match) => {
          return ESCAPE[match]
        })
        return `[?(@._key=='${escapedKey}')]`
      }

      return `[${segment.index}]`
    })
    .join('')}`
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
