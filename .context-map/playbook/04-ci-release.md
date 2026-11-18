# CI, releases, and local evidence

Scope: how a change gets validated locally, how CI lanes decide, and how the three release families ship. Everything below was read from the cited files at `0.2.2-rc.1` (branch `fix/dsh-bug-triage`, master `fcc0ad4621`). Commands come from [`package.json`](../../package.json); aggregate contents from [`scripts/run-gates.ts`](../../scripts/run-gates.ts).

## TL;DR

- Local hooks are deliberately narrow ([`lefthook.yml`](../../lefthook.yml)): pre-commit fixes staged lint, checks staged whitespace, translation pairing, pi-ai metadata and the vendor manifest; pre-push runs only `pnpm run typecheck`. CI owns exhaustive coverage and the platform matrix.
- `pnpm run test:coverage` — not `test` — is the CI coverage gate: per-file 100% on `packages/*/*/src`, with heavy suites run uninstrumented beside it ([`docs/testing.md`](../../docs/testing.md)).
- PR verdicts are aggregates: `all checks passed` ([`ci.yml`](../../.github/workflows/ci.yml)), `windows checks passed` ([`ci-windows.yml`](../../.github/workflows/ci-windows.yml)), `python checks passed` ([`ci-python.yml`](../../.github/workflows/ci-python.yml)), plus the `weighted approval` commit status ([`.github/review-ownership/README.md`](../../.github/review-ownership/README.md)).
- Master pushes run diagnostic references (`serial / linux`, `serial / windows`, Wine, sandbox real-kernel, Python runtime carriers); they do not gate PRs.
- Releases are three independent sequences (dsh, vendor, native) with local bump + CI pack rehearsal + tag-triggered publish. CI never writes to the repository ([`2026-08-10-npm-release-sequences.md`](../../.agents/notes/implemented/process/2026-08-10-npm-release-sequences.md)).

## Local commands: what they cover, when required

| Command | Covers | Required when |
|---|---|---|
| `pnpm run test` | All unit specs (`vitest run` after `build:native-system`) | Touched package behavior; focused `tests/*.spec.ts` usually suffices |
| `pnpm run test:coverage` | Gating coverage, per-file 100% on `packages/*/*/src` | CI lane; locally when adding branches/lines to package `src` |
| `pnpm run test:coverage:partitioned` | Same, split by `DSH_COVERAGE_PARTITIONS` into single-worker processes with one merged report ([`scripts/coverage-partitions.ts`](../../scripts/coverage-partitions.ts)) | CI coverage job; large local coverage runs |
| `pnpm run typecheck` | Typert contract generation, Host+Client package compilation, `tsc -b` aggregate checks; no native addon, bundles, Web | Any TypeScript change (also the pre-push hook) |
| `pnpm run lint` | `compile-referenced-projects host-contracts` then Oxlint ([`scripts/run-oxlint.ts`](../../scripts/run-oxlint.ts)) | Any `*.ts/tsx/mts/cts/mjs` change outside `vendor/*/src` |
| `pnpm run duplication` | Cross-file TypeScript clone detection (jscpd) | New or copied blocks of code |
| `pnpm run build:artifacts` | Full artifact order: native addon → Typert → Host tsc → Host tsdown → Desktop bundle → Client tsc → Client tsdown → Web ([`docs/development.md`](../../docs/development.md)) | Iterating where runnable `lib/` artifacts are needed |
| `pnpm run build:check` | Types-only check of both aggregates against existing declarations; never rebuilds | Before claiming TypeScript work complete, after the latest `build:artifacts` |
| `pnpm run build` | `build:artifacts` + `build:check` as one scheduled graph | Complete verification; required before built-artifact smokes |
| `pnpm run build:official` | Artifact build with official client branding, no dirty marker; `--serial` disables step overlap | Matching release/CI artifacts locally |
| `pnpm run test:snapshot` | Keyless replay of recorded Session scenarios (`DSH_EXAMPLE_MODE=lib`) | Every non-trivial model/protocol/user-visible change (new or updated scenario) |
| `pnpm run test:snapshot:record` / `:refresh` | Re-record with a key / rewrite expected output from valid replay input | Only when the model transcript or expected output genuinely changed; review every diff |
| `pnpm run test:expected` | Owner-local keyless process expectations (`*.expected.e2e.ts`) | Non-session CLI/process output changes |
| `pnpm run test:web` | Chromium (plus WebKit for the model picker) browser snapshots over `snapshots/web/` and `apps/web/tests/expected/` | Any user-visible Web/UI change |
| `pnpm run test:e2e` | Real-API suites; self-skip without `DEEPSEEK_API_KEY` | Provider/agent behavior that only a real model proves |
| `pnpm run test:bench` | Builds native support, libraries, benchmark workers, Web, then budgeted user-path benchmarks ([`scripts/run-ci-bench.ts`](../../scripts/run-ci-bench.ts)) | `benchmarks/` changes or a PR lane that owns a measured path |
| `pnpm run hygiene` | `publint`, workspace/package/dependency checks, NodeNext consumer check, product isolation, licenses, i18n, client package checks (list in `hygieneLeafGates`) | Manifests, public exports, entry points, build config, worker/bin entries |
| `pnpm run doc-sync` | `doc-typecheck`, `docs:build`, generated catalogs, links, wrap, budgets, upgrade guides, Agent Notes, persistence history, i18n pairing | Any doc/README/Agent-Note/catalog change (CI `static` lane also runs it) |
| `pnpm run test:docs` | Fast subset (`docQuickLeafGates`, `quick: true` leaves only, no builds) | Quick pre-push doc sanity |
| `pnpm run check:ci:static` | CI static aggregate: shared static gates + doc-sync leaves + module graph | Rehearsing the `node 24 / static` lane |
| `pnpm run check:ci` | Full primary aggregate (static + typecheck + lint + duplication + coverage + node smokes + snapshot + doc-sync + build + publint + node-next + built-bin smoke) | Serial reference rehearsal only; heavy |
| `pnpm run check:all` | `test`, `build`, `build:web`, snapshots, expected output, hygiene and doc-sync with build output | Opt-in comprehensive local run; not an agent default |
| `pnpm run change-scope --base <ref>` | Versioned JSON of committed/staged/unstaged/untracked paths against a resolved merge base ([`scripts/change-scope.ts`](../../scripts/change-scope.ts)) | First step of any pre-push evidence selection |

Gate knobs: `DSH_GATE_CONCURRENCY`, `DSH_GATE_FAIL_FAST=1`, `DSH_GATE_VERBOSE`, `DSH_OXLINT_THREADS`, `DSH_COVERAGE_MAX_WORKERS`, `DSH_COVERAGE_PARTITIONS`, `DSH_COVERAGE_TEST_TIMEOUT_MS`, `DSH_WEB_SNAPSHOT_WORKERS`, `DSH_CLI_HELP_CONCURRENCY` ([`scripts/parallelism.ts`](../../scripts/parallelism.ts), `ciWorkerEnvironment` in `run-gates.ts`).

## Gate scheduler semantics (`scripts/run-gates.ts`)

- Public aggregate names are package scripts (`check:ci:*`, `doc-sync`, `hygiene`, `check:all`, `node-compat`, `i18n`); the runner owns their validated dependency graphs and diagnostics. Unknown modes fail loud with the accepted list.
- Each `Gate` has `id`, `command`, `needs` (must succeed first) and `after` (must settle first, even if failed — used so diagnostics still run after a failure, e.g. web snapshots after build-artifact readers).
- The graph is validated for ambiguous/cyclic dependencies before execution; gates start FIFO, longest first.
- Worker budget: `defaultParallelism` (12 local gate/`build`/typecheck/oxlint/publint, 48 local Vitest forks; CI keeps runner CPUs). `check-all`, `hygiene`, `doc-sync`, `test:docs` are capped at `PROGRAM_MODE_CAP` (8) because many doc gates each build a full `ts.Program`.
- Coverage splits workers: instrumented share `total - floor(total/3)`, exempt heavy share the rest; `DSH_GATE_CONCURRENCY=1` makes the two gates not overlap at all. Exempt suites and their membership rules live in [`scripts/coverage-exempt.ts`](../../scripts/coverage-exempt.ts).
- CI env defaults are set only for aggregates that read them (`ci-unit` deliberately keeps the ambient env): `DSH_SNAPSHOT_MAX_WORKERS=1`, shared oxlint/publint snapshot concurrency, `DSH_WEB_SNAPSHOT_WORKERS=budget`, and `DSH_COVERAGE_PARTITIONS` from the instrumented share.
- `ci-build`/`ci-artifact-build` gates force official client branding via `CLIENT_BUILD_PROFILE_SELECTOR` without leaking it to siblings.

## CI lane map

| Workflow | Trigger | Jobs (run command) | Role |
|---|---|---|---|
| [`ci.yml`](../../.github/workflows/ci.yml) | `pull_request` only | `node 24 / static` (`check:ci:static`); `node 24 / coverage` (`check:ci:coverage`, bwrap prepared); `node 24 / lint` (`typecheck` + `check:ci:lint:contracts-ready`); `node 24 / benchmarks` (`check:ci:bench`, 20 min); `node 24 / snapshots and artifacts` (`check:ci:consumers`); `node-compat` matrix 24.9 + 26 (`check:node-compat`); `all checks passed` | Required Linux verdicts |
| [`ci-windows.yml`](../../.github/workflows/ci-windows.yml) | `pull_request` | `windows-build` (`check:ci:windows-blocking` + packaging priority/network scripts, observational `check:ci:windows-observational-ready`); `windows-coverage`; `windows-native-tests`; `windows checks passed` | Required native Windows signal |
| [`ci-python.yml`](../../.github/workflows/ci-python.yml) | `pull_request` | `python-sdk` (review-ownership unit tests + SDK pytest); `python-runtime` (reusable exe matrix); `python checks passed` | Required Python signal |
| [`release.yml`](../../.github/workflows/release.yml) | `pull_request`, push `master`, dispatch | `dependencies` (`verify-package-dependencies` + `verify-npm-install-layout`); `pack` (`release:verify --family dsh` → build → `release:pack dsh` → `release:pack vendor` → pack Landlock entry → `release:verify-packed-install`) | Pack rehearsal on every PR; no publish |
| [`release-vendor.yml`](../../.github/workflows/release-vendor.yml) | `pull_request`, push `master`, dispatch | `pack` (vendor verify → Host lib build → vendor pack → packed install) | Vendor rehearsal |
| [`release-publish.yml`](../../.github/workflows/release-publish.yml) | `workflow_dispatch` from `dsh-v*` tag (or `skip-tag-check`) | `cua-helper` (reusable package workflow), `pack`, `publish` (`release:publish --family dsh`) | dsh publication |
| [`release-vendor-publish.yml`](../../.github/workflows/release-vendor-publish.yml) | `workflow_dispatch` | `pack`, `publish` (`--family vendor`, optional `dist-tag`) | Vendor publication |
| [`ci-master.yml`](../../.github/workflows/ci-master.yml) | push `master`, dispatch (`suite`) | `serial / linux (self-hosted standby)` (`check:ci:linux-primary`), `serial / macos` (`check:ci`), `serial / windows (self-hosted standby)` (`check:ci:windows-complete`), `windows` Wine (`check:windows-wine`), reusable `ssh helper`/`python runtime`, runner benchmarks | Post-merge references, never PR gates |
| [`sandbox.yml`](../../.github/workflows/sandbox.yml) | push `master` | `sandbox e2e` real-kernel matrix (bwrap, landlock x64/arm64, seatbelt) + packed Landlock install; `unit-darwin` (`check:ci:unit` with `DSH_COVERAGE_TEST_TIMEOUT_MS=90000`) | Diagnostic real-kernel proofs |
| [`e2e.yml`](../../.github/workflows/e2e.yml) | PR (trusted, non-fork, non-Dependabot), push main/master, nightly `17 0 * * *`, dispatch | `e2e`: preflight requires `DEEPSEEK_API_KEY`, builds official (or artifacts on PR), `test:e2e`, 45 min | Real-API behavior |
| [`expected-filenames.yml`](../../.github/workflows/expected-filenames.yml) | PR touching `*golden*` paths | `no golden filenames` (`scripts/check-expected-filenames.sh`) | Naming policy: use "expected", not "golden" |
| [`node-addon-system.yml`](../../.github/workflows/node-addon-system.yml) | PR/push path-filtered to `native/system/**`, lockfiles, workflow | `matrix`, `native` (build/typecheck/native, flock on node 20/22/24/26 alpine + host) | Native addon |
| [`node-addon-system-release.yml`](../../.github/workflows/node-addon-system-release.yml) | `workflow_dispatch` (`publish`) | `matrix`, `build-prebuilds`, `pack`, `publish` (`publish-release.mjs`) | Native release |
| [`python-release.yml`](../../.github/workflows/python-release.yml) | `workflow_dispatch` | `build` (6 wheels), `python-compat`, `validate` (`twine check`, SHA256SUMS), `publish-runtime`, `publish-sdk` (PyPI OIDC) | Python publication |
| [`publish-ssh-helper.yml`](../../.github/workflows/publish-ssh-helper.yml) | `workflow_dispatch` | `validate`, `build`, `verify` (checksums), `publish` (draft GitHub Release) | SSH helper executables |
| [`build-exe-for-python-sdk.yml`](../../.github/workflows/build-exe-for-python-sdk.yml), [`build-exe-for-ssh-helper.yml`](../../.github/workflows/build-exe-for-ssh-helper.yml) | `workflow_call`, dispatch | `plan`, `sdk-wheel`/`build` | Reusable exe builders for the lanes above |
| [`docs-pages.yml`](../../.github/workflows/docs-pages.yml) | `workflow_dispatch` only (from `dsh-v*` tag) | `build` (`release:verify --family dsh` + `doc-sync`), `deploy` | Published-site snapshot; never a PR check |
| [`desktop-publish.yml`](../../.github/workflows/desktop-publish.yml), [`macos-package.yml`](../../.github/workflows/macos-package.yml), [`macos-intel-package.yml`](../../.github/workflows/macos-intel-package.yml), [`windows-package.yml`](../../.github/workflows/windows-package.yml), [`cua-helper-package.yml`](../../.github/workflows/cua-helper-package.yml) | dispatch / reusable | `package` (+ `upload-artifact`, `publish`) on self-hosted trial runners | Desktop/CUA artifacts |
| [`build-preview-cloudflare.yml`](../../.github/workflows/build-preview-cloudflare.yml) | `pull_request` opened/synchronize/reopened | `preview` (build, preview Vite build, wrangler deploy, comment URL) | PR preview site |
| [`pi-ai-provider-e2e.yml`](../../.github/workflows/pi-ai-provider-e2e.yml) | `workflow_dispatch` | `e2e` (Azure OpenAI, Anthropic) | Provider-specific e2e |
| [`pr-check-on-head-branch.yml`](../../.github/workflows/pr-check-on-head-branch.yml), [`pr-check-after-approve.yml`](../../.github/workflows/pr-check-after-approve.yml), [`pr-check-on-base-branch.yml`](../../.github/workflows/pr-check-on-base-branch.yml) | `pull_request_target` / review / push base | `master`, `pre-merge`, `approve`, `recheck` | Merge-policy scripts (`scripts/pre-merge-check.ts`), modes block/warn |
| [`weighted-approval.yml`](../../.github/workflows/weighted-approval.yml), [`weighted-approval-review-event.yml`](../../.github/workflows/weighted-approval-review-event.yml) | `pull_request_target`, `issue_comment`, `workflow_run`, review events | `publish-status`, `record-review-event` | 2-point approval gate + `/delegate` ([policy](../../.github/review-ownership/README.md)) |
| [`issue-lifecycle.yml`](../../.github/workflows/issue-lifecycle.yml), [`issue-policy.yml`](../../.github/workflows/issue-policy.yml) | issue / PR / review events | `lifecycle`, `policy` | Issue hygiene |

Required PR checks are the three aggregate verdict jobs plus the `weighted approval` commit status; the failover switches `DSH_CI_FAILOVER_LINUX` / `DSH_CI_FAILOVER_WINDOWS` re-point runners without a workflow merge ([runbook](../../.agents/notes/implemented/process/2026-07-26-ci-failover-runbook.md)).

## Release sequences

Three independent sequences — no shared version, trigger, or waiting ([note](../../.agents/notes/implemented/process/2026-08-10-npm-release-sequences.md)):

| Sequence | Members | Bump command | Pack (CI rehearsal) | Publish | Tag |
|---|---|---|---|---|---|
| dsh | public members of `packages/*/*` + `apps/*`, private dsh packages join the version bump | `pnpm run release:dsh patch` (or `major`/`minor`/explicit `x.y.z`, including `-rc.1`) | `release.yml` (every PR) | `release-publish.yml` dispatch | `dsh-v<version>` |
| vendor | the nine `vendor/*` packages, each on its own version line | `pnpm run release:vendor` (`--prerelease rc.1`) | `release-vendor.yml` (PR) | `release-vendor-publish.yml` | `vendor-<package>-v<version>` per package |
| native | `native/system/packages/*` | `pnpm --dir native/system release:bump` / `release:commit` | `node-addon-system.yml` (path-filtered PR) | `node-addon-system-release.yml` with `publish=true` | `node-addon-system-v<version>` |

dsh release flow: bump locally (writes manifests + `pnpm install --lockfile-only` + commit), merge, human creates the tag, dispatch `release-publish.yml` from that tag. CI only verifies and uploads; `release:verify` rejects a non-matching tag or mismatched member versions ([`scripts/release/verify.ts`](../../scripts/release/verify.ts)).

Vendor flow: bump advances the complete family from the higher of manifest and latest tagged version, then one tag per package; publish is idempotent per tarball — absent version publishes, same sha512 skips, different integrity fails ([`scripts/release/publish.ts`](../../scripts/release/publish.ts)).

Native flow ([`native/system/docs/release.md`](../../native/system/docs/release.md)): run the release workflow with `publish=false` to build/verify/pack and inspect `npm-tarballs`, push `node-addon-system-vX.Y.Z`, then run again with `publish=true`. Platform packages publish before the entry that optionally depends on them (`publish-order.txt`); never `pnpm publish` directly.

Publication rules that apply to all three: only from GitHub Actions; publish decides per package against the registry (never from a "what's in this release" list); `E409`/`E429`/5xx/network codes are retried with ≥2 s spacing because back-to-back publishes outrun the registry; prereleases map to npm dist-tags and stable goes to `latest` unless `--dist-tag` overrides; a dist-tag preflight rejects the whole attempt if the tag already names another version.

## Version and tag rules

- dsh: **one** version across the publish set, every private `packages/*/*` package, and the workspace root; its tag is `dsh-v<version>`. Prerelease channel comes from the version suffix: `alpha`/`canary` → that dist-tag, any other prerelease (`rc`, …) → `next`, none → `latest`.
- vendor: each package keeps its own upstream-derived line; tag prefix `vendor-<name-without-scope>-v`; a release always advances all nine; baseline is the higher of manifest and latest tag so a re-sync cannot reuse a version.
- native: one version for `native/system/package.json`, every platform package and the entry; tag `node-addon-system-v<version>`; prerelease → `next`.
- Frozen release inputs: `release:pack` calls `verifyBuildArtifacts`, which for dsh reads the client build record, so a missing or partially rebuilt official artifact tree cannot be packed. `release:verify` on a PR rehearsal checks the family version baseline and resolves the publish order; publish-affecting checks (`private: true`, tag match) run only when `RELEASE_PUBLISH=true`.
- Release guides, not release branches: the repository tags a commit on `master`; the policies in `pr-check-*.yml` additionally accept `release/dsh-<x.y.z>` branches as PR bases.

## Upgrade-guide obligation

Write a guide in the change that introduces the break, not at release time ([skill](../../.agents/skills/dsh-create-upgrade-guide/SKILL.md)):

- **Scope**: externally perceptible breaks only — `dsh` commands/flags/profile names, `cordis.yml`/patch/overlay/settings keys or accepted values, persisted user data, TS/Python SDK, JSON-RPC/HTTP/ACP messages, published package names and entry points.
- **Location**: `docs/upgrade-guide/v<version>/<item>/guide.md`, where `<version>` is the root `package.json` version at write time (currently `0.2.2-rc.1`, so a new break creates `docs/upgrade-guide/v0.2.2-rc.1/<kebab-item>/`), plus `guide.zh.md` and the pairing record `guide.i18n.yaml`. No index, no attachments.
- **Format**: frontmatter exactly `kind: upgrade-guide` + one-sentence `description`; one `#` title; exactly `## Change` and `## Migration` (zh: `## 变更`, `## 迁移`); ≤500 words. Enforced by [`scripts/verify-upgrade-guides.ts`](../../scripts/verify-upgrade-guides.ts).
- **Maintenance**: while the root version is unchanged, the current directory is the live delta from that release; update the covering guide in the same change, delete it on revert. After a bump, older directories are frozen.
- **Verify**: `pnpm run verify-upgrade-guides`, `pnpm run verify-translation-pairing docs/upgrade-guide/<path>`, `pnpm run verify-md-links`; the `upgrade-guides` gate is part of `doc-sync`/`test:docs`.

## Snapshot and benchmark ownership

Snapshots ([`snapshots/AGENTS.md`](../../snapshots/AGENTS.md)):

- `snapshots/` holds only tests whose committed Session JSONL is both replay input and expected persisted output. ARIA/geometry/generator/CLI/unit expectations live beside the owning app/package under `tests/expected/` and use `test:expected`, `test:web`, or `test`.
- Filenames: parent `session[.vN].jsonl`, children `session.<ordinal>[.vN].jsonl`; v0 omits the suffix; the highest generation per role is selected; record/refresh never rewrite a committed generation.
- `snapshot.yml` declares profile, composition/header class, recording policy, and format pin; a mutating scenario also commits `workspace.expected/` as an independent oracle.
- Replay is read-only; recording and refresh are local, credentialed, and every resulting diff is reviewed. The snapshot lane runs on macOS and Linux.

Benchmarks ([`benchmarks/AGENTS.md`](../../benchmarks/AGENTS.md)):

- One directory per measured user path (not per package); Host cases `*.bench.ts`, Client-face `*.bench.client.ts`; workers built into `benchmarks/.dsh-build/` and run under plain Node without a TS loader.
- Synthetic fixed inputs only — no recorded Sessions, user material, ambient repos, or network. Process-level wall-clock/RSS samples run in fresh children with private `mkdtemp` roots; budgets pass through `recordTimings` / `recordPeakMemory` in [`benchmarks/support/scaling-report.ts`](../../benchmarks/support/scaling-report.ts) and are enforced from reviewed constants, never env overrides.
- The PR gate is `node 24 / benchmarks` (`check:ci:bench`, 20-minute job) on standard GitHub-hosted Linux; `test:bench` locally rebuilds libraries, workers, and Web first. Package-local diagnostics use `.perf.ts` and do not join `test:bench`.

## Smallest correct evidence by change surface

Selection doctrine: one narrow check that would fail for the actual regression, run once; CI owns exhaustiveness ([pre-push skill](../../.agents/skills/dsh-pre-push-checks/SKILL.md)).

| Change surface | Evidence |
|---|---|
| One package's behavior | Its owning `tests/*.spec.ts`, filtered by file or `-t` name; add adjacent package tests only when a shared contract moved |
| Package `src` branches/lines | Focused `vitest run <owning tests> --coverage --coverage.include='packages/<group>/<pkg>/src/**/*.ts'`; unknown owners → `vitest related <src file>` then inspect the selection |
| Cross-package contract, event map, loop | `pnpm run test:coverage` scope for the affected packages, plus the owning snapshot lane |
| Model-, CLI-, editor-, terminal- or protocol-visible output | Focused `test:snapshot` scenario (record/refresh only for intended transcript changes) |
| User-visible Web/UI | `test:web` for affected browser snapshots plus the [UI review loop](../../.agents/skills/dsh-client-ui-ux/SKILL.md); tests alone are not visual acceptance |
| Docs, README, Agent Note, catalog, doc-linked comment | `pnpm run doc-sync` (or `test:docs` when no build is needed) |
| Manifests, exports, `bin`/worker entries, build config, built runtime paths | `pnpm run build` + `pnpm run hygiene` + the owning built-artifact smoke (`built-bin-smoke` e2e files) |
| TypeScript anywhere | `pnpm run build:check` after the latest `build:artifacts`, or `pnpm run build` |
| Provider/agent behavior against a real model | `pnpm run test:e2e` target when a key is available; never print secrets |
| Test/fixture introducing resource ownership, async teardown, ports, processes, shared host paths | Read [dsh-ci-test-reliability](../../.agents/skills/dsh-ci-test-reliability/SKILL.md) first; prove isolation and quiescent teardown |
| Release/version/manifest bump | `pnpm run release:verify --family <family>` plus the pack lane the PR already runs |

## Daily routine

After a rebase or merge of a moved base:

1. `git status --short --branch`; confirm the real PR base or stack parent.
2. `pnpm --silent run change-scope --base <verified-base-ref>` and re-read the combined scope; rerun only checks invalidated by the merge.
3. After `gh stack sync`: re-query heads and stack order, inspect every rewritten layer's scope, run the selected evidence per layer, keep PRs unmerged until it passes; if it fails, repair and publish the correction with `--force-with-lease` ([skill](../../.agents/skills/dsh-pre-push-checks/SKILL.md#post-sync-validation)).

Before push:

1. Run the selected evidence exactly once; the pre-push hook already runs `pnpm run typecheck`. Do not duplicate a passing check.
2. Commit; inspect files changed by the pre-commit fixer; push normally, or with `--force-with-lease=<branch>:<observed-oid>` for an authorized rewrite (never raw `--force`).
3. `git rev-parse HEAD origin/$(git branch --show-current)`, then `gh pr checks`; report pending as pending.

Before claiming completion:

1. `pnpm run build:check` after the latest `build:artifacts` (or `pnpm run build`) for any TypeScript change.
2. `pnpm run doc-sync` for docs; upgrade guide written when an external surface broke.
3. Snapshot added/updated for non-trivial model/protocol/user-visible behavior; benchmarks updated when a measured path changed.
4. Inspect `gh pr checks`: distinguish pending from failed, and check mergeability before blaming infrastructure — GitHub starts no `pull_request` runs on `CONFLICTING` PRs.

## Constraints & gotchas

- `test:coverage` is the gate, not `test`; coverage is per-file 100% on package `src`, and an uncovered line often means dead code.
- Source-plane vs artifact-plane: static gates and tests resolve workspace imports through `tsconfig` `paths` to `src`; only built lanes (`DSH_EXAMPLE_MODE=lib`, built smokes, pack) read `lib/`. A stale `build:artifacts` makes `build:check` report missing/incorrect declarations, not rebuilt ones.
- Hooks intentionally run no tests, snapshots, docs, builds, or hygiene; a green commit says nothing about those.
- `release-publish.yml` and `docs-pages.yml` are manual and tag-restricted; a PR can never publish.
- `all checks passed` is a verdict over jobs inside `ci.yml`; master-only lanes (Wine, serial references, sandbox matrix) are diagnostic and may fail without unblocking a PR.
- Real-API e2e is keyless-skipping: on trusted events a missing key is a hard preflight failure, not a skip.
- Version coherence is static: every dsh package version equals the root's, so a manual version edit anywhere fails the release/static gates.
- No file, test, or fixture may carry "golden" in its name outside `vendor/`.

## Open questions

1. Branch-protection settings themselves (which contexts are literally required) are repository configuration, not files; this map infers them from the aggregate jobs and the failover runbook.
2. Whether the `node-compat` matrix still includes "latest 24" (the workflow currently lists only `24.9` and `26`) while `docs/development.md` prose mentions three versions.
3. `release.yml` runs on every PR; no path filter is visible, so the pack rehearsal's cost for docs-only PRs is not bounded by the workflow itself.
4. Which `benchmarks/` directories are release-blocking versus advisory is stated per-directory in their READMEs; not audited here.
5. `docs-upgrade-guide` has no `v0.2.2-rc.1` directory yet, so the next release break starts a new directory rather than extending `v0.2.2-alpha.3`.
