# Plugin project: dsh-session-doctor

Status: **released via Git** on 2026-11-11 (GitHub `aturzone/dsh-session-doctor`, `332d983`; bundle row fixed to the scoped
package name). npm publish is still blocked on account 2FA, so Git is the only install path. Announced as Discussion
#12927 with verified pinned-install steps; linked from #11971/#11981.
Location: `.tools/plugins/dsh-session-doctor/` (git-excluded workspace copy of the GitHub repository).

## Why this plugin

The welcomed contribution route (`CONTRIBUTING.md`, `dsh-plugin` topic) does not need PR permission. It also directly
serves the failure classes we verified in Discussions #11971/#11981: a stored session whose events violate the V4
reader's turn/step/scope rules becomes permanently unloadable, and the harness gives no way to inspect which event
signature caused it. Our patches prevent new corruption (writer guard); this plugin diagnoses existing files and gives
users/ maintainers a concrete artifact for future reports.

## Product

- CLI `session-doctor [--home | --sessions-root] [--json]`: scans `<DSH_HOME>/sessions/<workspace>/<session>/session.vN.jsonl[.zstd]`,
  decodes zstd, replays reader rules, reports seq/type/code/detail. Exit 0/1/2.
- dsh bundle with a model-facing `session_doctor` tool over the same engine (read-only).
- Packaging: `package.json` with `dsh.bundle.patch`, `engines.dsh >= 0.2.2-rc.1 < 0.3.0`, `dsh-plugin` keywords,
  MIT.

## Verification (2026-11-05)

| Check | Result |
|---|---|
| Unit tests (`vitest --root .tools/plugins/dsh-session-doctor`) | **9/9 pass** — clean session, PTC orphan, step renumber, replacement tool/result, zstd roundtrip, invalid rows, highest-generation selection, missing root |
| CLI against synthetic corrupt fixture | exit 1, reports both orphan dispatch events with seq numbers |
| CLI against real DSH home (all workspaces) | **35 sessions scanned, 0 reader-incompatible signatures** (zstd + uncompressed paths exercised) |
| CLI against one real workspace bucket | 16 sessions, 0 issues |
| `tsc -p tsconfig.json` (strict, NodeNext) | pass — engine, CLI (`node:zlib` typed via `@types/node`), plugin shim against built declaration surfaces |
| `--json` output | structured report verified |
| Built artifact (`tsdown` → `dist/index.mjs`, `dist/cli.mjs`) | built CLI reproduces fixture exit 1 and real-home clean scan |
| `dsh plugin --profile demo add <path>` | bundle linked, `dsh.profile.bundles` gained `dsh-session-doctor`, `--dump-default-config` shows the inserted row |
| Runtime mount in a real boot | headless profile with the bundle mounted the plugin (temporary marker logged before the expected missing-credential exit) |
| Web-profile rehearsal | after `pnpm run build`: bundle added to the `web` profile, real web boot succeeded with **no startup failures**, plugin mounted, served page `HTTP 200` (40 KB) and JS asset `200` |
| Published-shape install | standalone `pnpm install --ignore-workspace` resolved real `@deepseek-ai/cordis@4.1.0` and `@deepseek-ai/dsh-tools@0.2.2-rc.1`; strict `tsc`, 9 tests, build all pass with no checkout path mappings |
| `pnpm pack` | tarball contains `package.json`, `README.md`, `LICENSE`, `cordis.patch.yml`, `dist/*.mjs` only |
| `--all-generations` audit | multi-generation fixture: default scans 2 sessions (highest only); the flag scans 3 and finds the corrupt retained `session.v3.jsonl` predecessor |

## Rules alignment

- Read-only: no session file is opened for writing; no lock file touched.
- No internal package imports in the engine (only `node:` builtins), so it survives dsh version drift; plugin shim
  imports only `@deepseek-ai/cordis` types and `defineTool` from `@deepseek-ai/dsh-tools` (peer deps).
- Local typecheck maps those two peers to the checkout's built declaration files via `tsconfig.json` paths; in the
  published package they resolve from `peerDependencies` instead.
- Signatures mirror the V4 reader: turn/step nesting, numbering, scope for turn-scoped/step-scoped events.

## Publishing plan (needs owner approval)

Assets are ready: LICENSE, `.github/workflows/ci.yml`, `.gitignore`, `PUBLISHING.md` runbook, announcement draft
(`playbook/08-dsh-session-doctor-announcement.md`), `prepare`/`prepack` build hooks, `publishConfig`.

1. Create public GitHub repo `aturzone/dsh-session-doctor` (public side effect — requires owner approval).
2. Fill repository metadata, verify CI green, rehearse a Git install into a scratch profile (not `link:`).
3. Optional npm publish under `next` dist-tag with the `engines.dsh` range.
4. Announce in #11971/#11981 as a diagnostic workaround, not a replacement for the writer fix.
5. Add to a plugin index only after the npm package exists.

## Open questions

- Answer from rehearsal: a bundle needs a built entry (`package.json` `main`/`bin` → `dist/*.mjs`); `link:` installs
  do not resolve the package's peer dependencies, so an npm/Git install (where the harness supplies peers) is the
  supported distribution shape.
- A linked bundle prints a peer-resolution warning from pnpm; confirm a published install resolves
  `@deepseek-ai/cordis`/`@deepseek-ai/dsh-tools` through the dsh runtime before announcing.
- Should the tool support a `quarantine` action (move generation to `corrupt/` after confirmation)? Read-only first.
- Should the scanner also audit every retained generation (`session.v3`, `v4` beside) rather than the highest only?
