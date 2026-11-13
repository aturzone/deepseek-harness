// @vitest-environment node
/**
 * The chat surface must stay direction-agnostic: physical left/right sides assume LTR and would place controls
 * on the wrong side for an RTL writing direction. The only exception is the statistics dialog, whose CSS anchor
 * positioning API (`anchor(left)`) exposes physical sides only.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const CLIENT_ROOT = fileURLToPath(new URL('../src/client', import.meta.url))
const ALLOWED = new Set(['chat/stat-dialog.module.css'])
const PHYSICAL_SIDE = new RegExp([
  '(^|[;{]\\s*|\\n\\s*)(margin|padding)-(left|right)\\s*:',
  '(^|[;{]\\s*|\\n\\s*)border-(left|right)(-width|-color|-style)?\\s*:',
  '(^|[;{]\\s*|\\n\\s*)(left|right)\\s*:',
  'text-align:\\s*(left|right)\\b',
].join('|'), 'g')

/** Every CSS module under the client root, relative to that root. */
function styleSheets(directory = CLIENT_ROOT): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return styleSheets(path)
    if (!entry.name.endsWith('.css')) return []
    return [relative(CLIENT_ROOT, path).split('\\').join('/')]
  })
}

describe('chat surface style sheets', () => {
  it('expresses direction-dependent sides with logical properties', () => {
    const offenders: string[] = []
    for (const file of styleSheets()) {
      if (ALLOWED.has(file)) continue
      const source = readFileSync(join(CLIENT_ROOT, file), 'utf8')
      for (const match of source.matchAll(PHYSICAL_SIDE)) {
        const line = source.slice(0, match.index).split('\n').length
        offenders.push(`${file}:${line} ${match[0].replace(/\s+/g, ' ').trim()}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
