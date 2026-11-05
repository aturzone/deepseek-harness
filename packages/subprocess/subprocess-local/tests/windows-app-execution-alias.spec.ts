/** Windows App Execution Alias acceptance in host executable resolution. */

import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LocalSubprocessRuntime, { isWindowsAppExecutionAlias } from '../src/index.ts'

const fsControl = vi.hoisted(() => ({ statCode: undefined as string | undefined }))

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    stat: vi.fn(async (path: unknown, ...rest: never[]) => {
      if (fsControl.statCode !== undefined) {
        throw Object.assign(new Error(`${fsControl.statCode}: injected alias ACL`), { code: fsControl.statCode, path })
      }
      return (actual.stat as (path: unknown, ...args: never[]) => Promise<unknown>)(path, ...rest)
    }),
  }
})

const roots: string[] = []

afterEach(async () => {
  fsControl.statCode = undefined
  vi.restoreAllMocks()
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

/** Create the Store-alias shape: a symlink entry beside its real target. */
async function alias(): Promise<{ root: string; link: string }> {
  const root = await mkdtemp(join(tmpdir(), 'dsh-windows-alias-'))
  roots.push(root)
  const target = join(root, 'pwsh-real.exe')
  await writeFile(target, '')
  const link = join(root, 'pwsh.exe')
  await symlink(target, link)
  return { root, link }
}

describe('isWindowsAppExecutionAlias', () => {
  it('accepts a symlink entry on Windows when stat hit the target ACL', async () => {
    const { link } = await alias()
    expect(await isWindowsAppExecutionAlias(link, { code: 'EACCES' }, 'win32')).toBe(true)
    expect(await isWindowsAppExecutionAlias(link, { code: 'EPERM' }, 'win32')).toBe(true)
  })

  it('rejects the same shape off Windows or for an unrelated failure', async () => {
    const { link } = await alias()
    expect(await isWindowsAppExecutionAlias(link, { code: 'EACCES' }, 'linux')).toBe(false)
    expect(await isWindowsAppExecutionAlias(link, { code: 'ENOENT' }, 'win32')).toBe(false)
    expect(await isWindowsAppExecutionAlias(join(link, 'missing'), { code: 'EACCES' }, 'win32')).toBe(false)
  })
})

describe('resolveExecutable on Windows App Execution Aliases', () => {
  it('returns the alias when stat follows the reparse point into an ACL failure', async () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('win32')
    const ctx = new Context()
    const fiber = await ctx.plugin(LocalSubprocessRuntime)
    try {
      const { link } = await alias()
      fsControl.statCode = 'EACCES'
      expect(await ctx.subprocess.resolveExecutable(link)).toBe(link)
    } finally {
      fsControl.statCode = undefined
      platform.mockRestore()
      await fiber.dispose()
    }
  })

  it('still reports a real miss when no alias entry exists', async () => {
    const platform = vi.spyOn(process, 'platform', 'get').mockReturnValue('win32')
    const ctx = new Context()
    const fiber = await ctx.plugin(LocalSubprocessRuntime)
    try {
      fsControl.statCode = 'EACCES'
      await expect(ctx.subprocess.resolveExecutable('/dsh-no-such-alias.exe'))
        .rejects.toThrow('is not an executable file')
    } finally {
      fsControl.statCode = undefined
      platform.mockRestore()
      await fiber.dispose()
    }
  })
})
