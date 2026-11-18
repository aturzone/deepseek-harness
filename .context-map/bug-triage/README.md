# Bug triage + first fixes — 2026-11-03

Checkout: `master` @ `8bd073392e` (root `0.2.2-alpha.3`). Branch: `fix/dsh-bug-triage`.
Channel reality: GitHub **Issues are disabled**; all reporting flows through **Discussions** (11,774 threads), where
upvotes/comments are the triage signal (`CONTRIBUTING.md:9-11`, repo has `has_issues: false`).

## Triage method

1. Search recent `[Bug]`-titled discussions (`search query: repo:deepseek-ai/deepseek-harness [Bug] in:title`
   → 2,901 hits), sorted by last update.
2. Filter for reports that are: platform-relevant to Linux, still open on current master, reproducible without a
   live model key, and carrying a concrete technical claim that can be checked against source.
3. Verify each shortlisted claim in the checkout before touching code.

## Shortlist

| Discussion | Claim | Verdict |
|---|---|---|
| **#11971 + #11981** | PTC dispatch events written outside an open turn make the session permanently unloadable | **Confirmed and fixed** (commit `e2eba3dbf6`) |
| **#11763** | `settings/describe` crashes on a Standard-Schema `Config` with `toJSON()`; desktop welcome dies | **Confirmed and fixed** (commit `e0df0c36ed`) |
| #11981 (2nd class) | step numbers restart inside one turn (9 `standard` sessions) | Plausible; separate writer/reader invariant, not addressed here |
| #11121 | `dsh-hmr` `runExclusive` leaks an `AsyncLocalStorage` transaction into `apply()` timers after hot reload | Community re-reproduced on `8bd073392e`; complex queue/ownership redesign, not started |
| #10282 | Web provider add/remove fails with `profile reload requires the root Include entry` | Root cause (WeakMap keyed by Context identity) verified by another commenter; UI-path reproduction not attempted |
| #11986 / #11423 | `auto` preset rejects every tool call on `opencode-go` routes | Provider-specific (no key/route available locally); not verified |
| #10847 | exact-pinned vulnerable deps (undici, zod, …) | Dependency-policy item, not a code defect; needs maintainer decision |

## Fix 1 — Discussion #11763: settings crash on non-Schemastery Config

**Symptom.** A plugin whose `Config` is a valid Standard Schema object exposing `toJSON()` but not a Schemastery
schema makes `settings/describe` return `{ok:false, code:'gateway/internal', message:"Cannot read properties of undefined (reading 'volatile')"}`;
the desktop welcome then fails with `Web RPC failed`.

**Root cause.** `Settings.schema()` (`packages/settings/settings/src/index.ts`) accepted any `Config` with `toJSON`
and cast it to Schemastery; `describe()` passed it to `volatileForm()`
(`packages/settings/settings/src/schema.ts:38`), which reads `schema.meta.volatile` — a Standard Schema object has no
`meta` graph.

**Reproduction (pre-fix).**

```sh
source .tools/env.sh
pnpm exec tsx .tools/repro/settings-crash.ts     # CRASH: Cannot read properties of undefined (reading 'volatile')
```

**Fix.** Structural Schemastery recognition in `src/schema.ts`:
`Reflect.get(candidate, Symbol.for('schemastery')) === true` (global registry symbol set on `Schema.prototype` in
`vendor/schemastery/lib/index.mjs:3,50`, cross-copy safe) plus an object `meta` (injected at `:48`).
`SettingsForms.schema()` returns `undefined` for unsupported Configs, so `describe()` skips them instead of crashing.
Note: Schemastery itself implements `~standard` (`vendor/schemastery/lib/index.mjs:52`, relied on by
`vendor/cordis/src/fiber.ts:53`), so `~standard` cannot be the discriminator.

**Tests.** Guard-level regression in `packages/settings/settings/tests/schema.spec.ts`; real-composition
describe-level regression in `configuration.spec.ts` (asserts the offending entry is skipped, the rest still render,
and `update()` rejects with a clear error). Both fail on unfixed code.

**Risk.** Non-Schemastery `Config`s were never renderable (describe crashed), so skipping is a crash fix, not a
behavior regression. The guard duplicates app-boot's `isNativeConfigSchema` without its `type` requirement; a shared
helper is a possible follow-up.

## Fix 2 — Discussions #11971 / #11981: PTC records corrupt the session log

**Symptom.** A stored session fails to open with
`SessionFormatError: tool/ptc-dispatch-start is outside an open turn`; no downgrade. One poisoned blank session can
block every later "new session" (`#11971`). Triggers: `ptc` preset `run_code` runs whose turn ends by abort/error.

**Root cause.** Writer and reader disagree.
- Reader (`packages/session/session-format-v3-to-v4/src/relationships.ts`) rejects turn-scoped events outside a turn.
- Writer (`Session.append`, `packages/core/session/src/index.ts`) never checked turn state.
- Trigger: agent-loop appends `turn/end` in a `finally` (`packages/core/agent-loop/src/agent.ts`), while
  `tool-executor-ptc` keeps appending `tool/ptc-dispatch-start` (`src/ptc.ts`) and `tool/ptc-dispatch` from its async
  settle lane afterwards.

**Reproduction (pre-fix, deterministic, no model key).**

```sh
source .tools/env.sh
pnpm exec tsx .tools/repro/session-corrupt.ts
# WRITER: accepted tool/ptc-dispatch-start after turn/end (BUG PRESENT)
# READER: rejected -> tool/ptc-dispatch-start is outside an open turn
```

**Fix.**
1. `Session` tracks the open turn (`turn/start` opens, `turn/end` closes, seeded logs replay it) and rejects the PTC
   dispatch pair at the append site with exported `SessionTurnScopeError` before the log changes.
2. The PTC bridge records whether each sub-call's start entered the log; if its owning turn closed first it drops the
   log-only record with a warning and never appends a settle without its start, so no orphan event lands and the run
   still completes.
3. Fixtures in 4 packages that logged PTC dispatches without opening a turn now open one (assertions unchanged).

**Scope note.** The reader's full turn/step-scoped set is documented but only the PTC pair is enforced here: manual
compaction legitimately runs between turns and appends only reader-legal events, while the remaining types need a
separate append-site/fixture audit. That is deliberate, documented in `packages/core/session/src/index.ts`.

**Tests.** New `packages/core/tool-executor-ptc/tests/turn-scope.spec.ts` (reject after `turn/end`, log stays
readable, valid in-turn sequence, non-turn-scoped appends, restored open tail) plus two PTC regressions (drop before
start, drop before settle). Both verified to fail with the guard removed.

## Verification run (Lead)

```sh
source .tools/env.sh
pnpm exec vitest run packages/core/session/tests packages/core/tool-executor-ptc/tests packages/settings/settings/tests
# 30 files, 855 tests passed
pnpm run typecheck        # 5/5 gates passed
pnpm run test:docs        # 21/21 gates passed
# session-guard's wider run: 76 files / 1757 tests passed
#   (session 583, ptc 224, agent-loop 491, patched fixture dirs 459)
```

Commits on `fix/dsh-bug-triage`:

- `e0df0c36ed` fix(settings): skip Config schemas that are not Schemastery in describe
- `e2eba3dbf6` fix(session): reject turn-scoped PTC records outside an open turn

## Published (2026-11-03)

- Fork: `aturzone/deepseek-harness`; branch `fix/dsh-bug-triage` pushed.
- Comment on #11763: https://github.com/deepseek-ai/deepseek-harness/discussions/11763#discussioncomment-19370719
- Comment on #11971: https://github.com/deepseek-ai/deepseek-harness/discussions/11971#discussioncomment-19370740
- Drafts kept in `draft-11763.md` / `draft-11971.md` (pre-publication record).

## Next actions

1. **Post to Discussions** — a comment on #11763 and #11971 with the confirmed root cause, deterministic repro, and
   patch summary; link a fork branch if we create one. This is public, so it needs explicit approval.
2. **Publish the patch** — create a fork (`aturzone/deepseek-harness`), push `fix/dsh-bug-triage`, and offer the diff.
   External PRs are closed, but a prepared branch can be linked or submitted the day policy changes.
3. **Continue triage** — #11981's second class (step renumbering) and #11121 (HMR transaction leak) are the next
   highest-signal candidates.

Caveat: the full CI coverage gate (`pnpm run test:coverage`) is running; the per-file 100% gate applies in CI's
partition mode, and changed files must satisfy it before any upstream submission.

## 2026-11-04 — follow-up round

- Response check (≈19h after posting): no replies or reactions on #11763 and #11971; upstream still at `8bd073392e` (0 new commits).
- Cross-linked the PTC corruption analysis into #11981 (the duplicate report with the strongest evidence):
  https://github.com/deepseek-ai/deepseek-harness/discussions/11981#discussioncomment-19389727
- Analyzed #11981's **second class** (step numbers restarting inside one turn) and posted findings:
  https://github.com/deepseek-ai/deepseek-harness/discussions/11981#discussioncomment-19389782
  Conclusion: current master has a single `step/start` writer (`agent-loop/src/agent.ts:361`), `phase.step` moves monotonically and resets only after `turn/end`, the driver is sequential, and cross-process writes are excluded by the JSONL `flock` lease — so the B-class signature is likely from an older build or an unpinned race. Asked for the producing version plus one session artifact.
- Implemented the community-agreed fix for #11121 (`dsh-hmr` transaction context leaking into timers/callbacks):
  - branch `fix/hmr-transaction-context`, commit `c338f20147` on the fork, based on `8bd073392e`
  - per-transaction `{ active }` AsyncLocalStorage value cleared on settle; all four readers updated (`?.active`), including the `reconcileProfile()` guard
  - new coordination tests: async descendants after success/throw/reject, rejected-nested-does-not-stall-queue, timer registered inside the transaction, settled-descendant reconciliation guard; verified failing on pre-fix source
  - HMR package 242/242 tests, typecheck 5/5, Oxlint clean, README (EN+ZH) documents the transaction lifetime
  - posted: https://github.com/deepseek-ai/deepseek-harness/discussions/11121#discussioncomment-19390018

## 2026-11-05 — upstream release wave + first maintainer-grade reply

- Upstream moved **260 commits** to `fcc0ad4621` (`release(dsh): 0.2.2-rc.1`), including vendored Cordis 4.1.0,
  Schemastery 3.19.0, timer 1.2.0, and PTC call-budget/timeout work in `tool-executor-ptc/src/ptc.ts`.
- Our bugs are still unfixed upstream (settings/session blobs unchanged; no session-turn-scope commit).
- **PerryLink replied on #11763** (2026-11-04): confirmed the report on `fcc0ad46`, agreed `~standard` cannot be the
  discriminator, and asked that the form builder also tolerate a missing meta graph:
  https://github.com/deepseek-ai/deepseek-harness/discussions/11763#discussioncomment-19399657
- Implemented that hardening (`schema.meta?.volatile` in `volatileForm`/`isVolatilePath`, cast-free runtime test),
  rebased both branches onto `fcc0ad4621`, re-verified, and replied:
  https://github.com/deepseek-ai/deepseek-harness/discussions/11763#discussioncomment-19412339
- Branch heads: `fix/dsh-bug-triage` @ `38618c55cf` (settings `8579a7f370`), `fix/hmr-transaction-context` @ `7d062c88dc`.
- Re-verified after rebase: typecheck 5/5; session+PTC+settings 883/883; HMR 242/242.
- Build artifacts are now stale relative to `fcc0ad4621`; rebuild before relying on built output.
