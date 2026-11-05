/** Reading `pnpm view` answers about published versions. */
import { expect, it } from 'vitest'
import { newerVersions, versionFacts } from '../src/versions.ts'

it('reads one version\'s manifest, keeping the asked identity when the answer omits it', () => {
  const bundle = { bundle: { patch: './p.yml' } }
  expect(versionFacts({ name: 'x', version: '1.0.0', engines: { dsh: '>=1' }, peerDependencies: { a: '1' }, deprecated: 'old', dsh: bundle }, 'y', '2.0.0')).toEqual({
    manifest: { name: 'x', version: '1.0.0', engines: { dsh: '>=1' }, peerDependencies: { a: '1' } }, bundle: true, deprecated: 'old',
  })
  expect(versionFacts({ dsh: { bundle: 'no' }, deprecated: '' }, 'y', '2.0.0')).toEqual({ manifest: { name: 'y', version: '2.0.0' }, bundle: false })
  expect(versionFacts('scalar', 'y', '2.0.0')).toEqual({ manifest: { name: 'y', version: '2.0.0' }, bundle: false })
})

it('treats a renumbered release line as no update when latest matches the installed version', () => {
  // 0.12.3 sorted above 0.2.x, but the registry's latest tag says the installed 0.2.6 is current.
  expect(newerVersions({
    versions: ['0.12.3', '0.2.6'], time: {}, 'dist-tags': { latest: '0.2.6' },
  }, '0.2.6')).toEqual([])
})

it('drops a greater-version line that predates the installed build and orders latest first', () => {
  expect(newerVersions({
    versions: ['0.12.3', '0.2.6', '0.2.7'],
    time: {
      '0.12.3': '2026-10-19T00:00:00.000Z',
      '0.2.6': '2026-11-04T00:00:00.000Z',
      '0.2.7': '2026-11-05T00:00:00.000Z',
    },
    'dist-tags': { latest: '0.2.7' },
  }, '0.2.6')).toEqual([
    { version: '0.2.7', publishedAt: '2026-11-05T00:00:00.000Z', tags: ['latest'], prerelease: false },
  ])
})

it('falls back to publish time against the installed version when the latest tag is absent', () => {
  const answer = {
    versions: ['0.12.3', '0.2.6', '0.2.7', '0.2.8'],
    time: {
      '0.12.3': '2026-10-19T00:00:00.000Z',
      '0.2.6': '2026-11-01T00:00:00.000Z',
      '0.2.7': '2026-11-02T00:00:00.000Z',
      '0.2.8': '2026-10-30T00:00:00.000Z',
    },
    'dist-tags': {},
  }
  // 0.12.3 and 0.2.8 predate the installed 0.2.6; only genuinely later publishes remain.
  expect(newerVersions(answer, '0.2.6').map(version => version.version)).toEqual(['0.2.7'])
})

it('orders newer semver versions newest first and ignores time and tags that are not objects', () => {
  expect(newerVersions({ versions: ['1.0.0', '1.10.0', '1.2.0', 7], time: 'x', 'dist-tags': [] }, '1.0.0')).toEqual([
    { version: '1.10.0', tags: [], prerelease: false },
    { version: '1.2.0', tags: [], prerelease: false },
  ])
  expect(() => newerVersions(null, '1.0.0')).toThrow('pnpm view answered no versions')
})
