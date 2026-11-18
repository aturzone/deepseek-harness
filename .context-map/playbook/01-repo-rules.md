# Playbook 01 — The binding rule system

Repository: `/home/atur/Documents/deepseek-harness`, branch `fix/dsh-bug-triage`, master `fcc0ad4621`, root `version` `0.2.2-rc.1` (`package.json`). Every citation is `file:line` against this checkout; the legend expands the short names used below. Rules are ordered by how a reviewer judges them, not alphabetically. Anything not traceable to a citation is marked **(unverified)**.

## Legend — citation aliases

| Alias | Exact file |
|---|---|
| `AGENTS` | `AGENTS.md` (root standing orders) |
| `PKG` | `packages/AGENTS.md` |
| `DOCS` | `docs/AGENTS.md` |
| `ARCH` | `docs/architecture.md` |
| `DEF` | `docs/defensive-patterns/README.md` |
| `NOTES` | `.agents/notes/README.md` |
| `IMPL` | `.agents/notes/implemented/AGENTS.md` |
| `PROSE` | `.agents/skills/dsh-prose-standard/SKILL.md` |
| `PRDESC` | `.agents/skills/dsh-pr-description/SKILL.md` |
| `SIMP` | `.agents/skills/dsh-find-simplifications/SKILL.md` |
| `AGEXP` | `.agents/skills/agent-experience/SKILL.md` |
| `CORDIS` | `.agents/skills/cordis-styling-nitpicking/SKILL.md` |
| `ERR` | `.agents/skills/dsh-error-handling/SKILL.md` |
| `PROJ` | `.agents/skills/dsh-session-projection/SKILL.md` |
| `LABELS` | `.agents/notes/implemented/process/2026-08-08-unified-github-label-taxonomy.md` |
| `STACK` | `.agents/notes/implemented/process/2026-08-02-native-github-stacks-and-optional-rebases.md` |

## How the rule system binds

Five layers, each with its own job; a lower layer never overrides a higher one.

1. `AGENTS` is standing orders (one to three lines per rule, `DOCS:21`). It is the first thing to read and the last thing to violate.
2. Subtree `AGENTS.md` files add orders for one subtree only: `packages/` (`PKG:3`), `docs/` (`DOCS:1`), `.agents/notes/` (`.agents/notes/AGENTS.md:1`), `.github/`, `scripts/`.
3. `ARCH` is the ordered map of the shipped composition and extension points; read it before changing `packages/` (`AGENTS:3`, `ARCH:5`).
4. `DEF` carries review-enforced rules per artifact: read the page for the artifact you are about to change, before you change it (`DEF:5`, `DEF:17-23`).
5. Agent Notes (`NOTES`) record the *why* and the alternatives; `implemented/` notes describe shipped reality, archived notes are frozen history (`NOTES:13`, `NOTES:42`). When a rule's rationale matters, the note is the authority; when the rule's behavior matters, code and READMEs are.

Skills (`.agents/skills/*`) are workflows and editorial standards, not product contracts; they state their own scope limits (for example `PROSE:8` calls itself guidance, not a script).

## 1. Repository and package conventions

- Name every workspace `@deepseek-ai/dsh-<name>`; `vendor/` is rescoped and `private: true`; harness packages declare `@deepseek-ai/cordis` in `peerDependencies`/`devDependencies`; DSH workspace deps use `workspace:*`, vendor/native use `workspace:~` (`AGENTS:132`).
- ESM everywhere (`"type": "module"`). Across packages import by package name; in local relative imports include the `.ts` extension (`AGENTS:133`). Modules reachable from the `dsh` CLI source launch must stay ESM (no CJS-only exports) (`AGENTS:133`).
- Plugin export forms are fixed: a service package default-exports its service class; a function plugin named-exports `name`/`inject`/`Config`/`apply` and has **no** default export — mixing them makes the Loader discard the function plugin's namespace (`PKG:5`).
- Optional services are read with strict `ctx.get(name)`; reserve `ctx.<name>` for declared injections because the property proxy is topology-sensitive (`PKG:6`).
- Each package tsconfig extends `tsconfig.base.json` (Client: `tsconfig.base.client.json`), sets `rootDir: src`, `outDir: lib/types`, references workspace dependencies, and registers in exactly one aggregate; only packages with distinct Host and Client compiler faces split into leaf configs plus a solution-only root (`PKG:24`, `AGENTS:150`).
- `src/types.ts` holds types only, never runtime code (`PKG:25`). Tests live under package `tests/`, not `src/__tests__/` (`PKG:26`).
- A behavior change updates its package README and JSDoc in the same commit; READMEs document model/token/KV-cache effects in the canonical Model Experience format and durable gaps under `## Known Limitations and Deferred Work` (`PKG:27-29`).
- Model-facing contracts are written from the model's perspective: prompts, tool schemas, results, and diagnostics carry task-relevant concepts only, not UI, transport, or implementation vocabulary (`PKG:15`).
- Enforce each decision in the operation that makes it; schema omission, prompt filtering, facades, wrappers, and listener order are not enforcement when another caller bypasses them (`PKG:16`).
- Publish state and emit notifications only at the commit point; derive caches, prompts, UI echoes, replay, and query views from one authoritative source (`PKG:17`).
- Apply byte/token/item/time bounds to the complete result including wrappers and metadata; test tiny, exact, oversized-single-chunk, and multibyte limits (`PKG:18`).
- One asynchronous operation gets one lifecycle controller or transaction; separate readiness/cancellation/disposal/reservation/sentinel state needs an independent owner (`PKG:9`).
- Business rules live in their own package with a registration surface; a generic runtime/controller/gateway carries only orchestration (`PKG:14`).
- Every abstraction, option, defensive copy, and compatibility path needs a current owner and a current consumer; evidence, not configurability, justifies a public choice (`PKG:11-12`).
- Design a Service Definition for all current consumers; tool-schema, Loader, UI, transport, and provider specifics stay in the consumer or provider (`PKG:10`).
- Shared state hangs on a service or instance. Module-level caches, `Symbol.for`, `globalThis`, `window.__X__`, and new global `current`/`active`/`selection` singletons are forbidden (`PKG:13`).
- Initiator-owned chains derive then capture: under `ctx.agents.withInitiator()`, recover the Agent, derive `agent.session`, keep `Agent`/`Session` explicit at lifecycle, session-log, service, authority, worker/process, persistence, and wire interfaces (`PKG:8`).

## 2. Text and code style (mechanically enforced)

| Rule | Value | Enforcement |
|---|---|---|
| Line endings | LF in repo and editors; `*.cmd` stays CRLF | `.gitattributes:6-7`, `.editorconfig:7` |
| Final newline | exactly one; `eol-last` = always | `AGENTS:169`, `.oxlintrc.json:281`, pre-commit `git diff --cached --check` (`lefthook.yml:24-25`) |
| Indentation | 2 spaces | `.oxlintrc.json:262` |
| Semicolons | none | `.oxlintrc.json:266` |
| Quotes | single, `avoidEscape` | `.oxlintrc.json:270` |
| Dangling commas | always on multiline | `.oxlintrc.json:277` |
| Trailing spaces | none | `.oxlintrc.json:285` |
| Object braces | spaced (`{ ... }`) | `.oxlintrc.json:286` |
| Arrow parens | as-needed, required for block bodies | `.oxlintrc.json:290` |
| Member delimiters | none when multiline, semicolon when single-line | `.oxlintrc.json:297` |
| Line width | max 140 code characters, URLs/strings/template literals ignored | `.oxlintrc.json:310-313` |
| Declarations | `no-var`, `prefer-const` errors | `.oxlintrc.json:46-47` |
| `any` | `typescript/no-explicit-any` = error; every intentional `any` needs a narrow suppression with rationale | `.oxlintrc.json:84`, `AGENTS:177` |
| Vendored code | excluded from lint/prose rules, keeps upstream style | `.oxlintrc.json:25`, `PROSE:22` |

`vendor/` changes additionally require the vendor manifest update in the same staged set (`lefthook.yml:31-32`, `AGENTS:189`).

## 3. Cordis invariants (what review actually blocks on)

- **Registrations are effects.** Every contribution goes through `ctx.effect()` / `ctx.on()`; a registry's `register()` returns the disposer directly or through its documented registration handle (`AGENTS:134`, `ARCH:11`).
- **Every registry contribution proves disposal** through the HMR-safety test: dispose the contributing fiber, observe removal (`PKG:19`).
- **Waterfall listeners MUST call `next()`** to delegate; returning without it short-circuits the chain (`AGENTS:137`, `ARCH:108`).
- **Typed events use declaration merging** and merge-extensible maps. Event JSDoc needs `@mode` and payload `@param`; public service methods document parameters and non-void returns; `SessionEventMap` members are required-on-read unless the envelope carries `ignorable: true` (`AGENTS:135`).
- **Switch on discriminant tags.** Closed unions end in `assertNever`; merge-extensible unions fall through a documented default (`AGENTS:136`).
- **A capability seam has three roles** — Service Definition, Service Provider, Consumer — and is complete, never one role; split only when roles evolve independently (`AGENTS:141`, `ARCH:138-140`).
- **Plugins, not loop changes.** New behavior attaches to a documented extension point; changing the loop updates `ARCH` (`AGENTS:140`, `ARCH:144-146`). The routing table is `ARCH:148-169` (e.g. model provider → `ctx.llm`; model-facing capability → `ctx.tools`; shell backend → `ctx.shell`; human command → `ctx.commands`; background job → `ctx.jobs`; durable state → extend `SessionEventMap`).
- **No hardcoded tunables in plugins.** Deployment-varying choices are validated `Config` fields changeable from `cordis.yml`; a `DEFAULT_*` constant or test hook is not configurability. Protocol constants, external specs, and security invariants stay fixed (`AGENTS:144`).
- **Explicit > implicit at package boundaries.** Defaulting is an explicit `resolve(request): Spec` step in the owning implementation, never a hidden `?? default` inside `run()` (`AGENTS:143`).
- **Misconfiguration fails loud** at load when self-contained, otherwise at the earliest resolvable point; never silently skip a missing referent (`AGENTS:145`).
- **Opaque cross-boundary ids are branded** (`Branded<B>` from `dsh-brand`), never bare `string` (`AGENTS:146`).
- **Trust TypeScript at typed same-process boundaries.** Do not add runtime validation, fallback behavior, or hostile-input tests solely for statically required values; validate at parser/config, queued, model/tool JSON, durable/file, worker, process, and wire boundaries (`AGENTS:147`).
- **Source plane vs artifact plane, never mixed.** Static gates and tests resolve workspace imports through tsconfig `paths` to `src` and pass on a clean tree; gates consuming built `lib/` declare that dependency (`AGENTS:149`, `AGENTS:121`).
- **Compiler faces stay explicit.** Repo-wide programs seed `tsconfig.host.json` or `tsconfig.client.json`, never the root solution (`AGENTS:150`).
- **Lifecycle audit rules (P0):** no module-level singleton state (`CORDIS:25-29`); no unreversed side effect after disposal (`CORDIS:31-35`); no cleanup dependency released before the consumer finishes (`CORDIS:37-43`). Disposers of sibling effects run concurrently on fiber unload, so stop admission, settle consumers while their dependencies remain usable, then drain (`CORDIS:41-43`).

## 4. Model-visible ⟺ logged, Sessions, persistence

- **The rule:** anything that reaches a model request must be reconstructable from the session log; a new model-visible input requires a session event (`AGENTS:138`, `ARCH:130`). The session log is the source of model context; `deriveMessages()` projects history from it (`ARCH:126`).
- **Message projections:** plugins that change existing message content register pure message projections rather than rewriting derivation (`ARCH:130`).
- **Projection ownership:** put all persisted or restorable session-derived state in a Projection; keep the ready handle private and expose domain methods; recovery through `init`/`apply` is synchronous and deterministic with no I/O, hooks, models, or tools; caches must be discardable and rebuildable; await required registration before exposing synchronous readers; switching a read path requires identifying every consumer, including both SDKs (`PROJ:10`, `PROJ:12-32`).
- **Format authority:** `SESSION_FORMAT_VERSION` in `packages/core/session/src/types.ts` is the only hand-maintained writer number in code (`docs/session-format-status.md:20`).
- **Bump criteria:** bump only when existing discriminators cannot prevent unsafe interpretation; same-version changes require safe reader behavior (`AGENTS:135`).
- **Generation immutability:** adjacent migrations may add a version-named successor but never move, overwrite, or delete committed generations; predecessors imply neither fallback nor downgrade support (`AGENTS:7`, `ARCH:128`). JSONL v0 uses `session.jsonl[.zstd]`, v1+ uses lowercase `session.vN.jsonl`, and committed paths are never renamed/replaced/deleted (`ARCH:128`).
- **SQLite** uses a monotonic `SCHEMA_VERSION` (`AGENTS:7`).
- **Declared persistence-type changes are acknowledged** with the local record/verify flow before a PR (`AGENTS:9`, `docs/cookbook/reviewing-persistence-type-changes.md:49`).
- **Both SDKs project the loop.** Agent-loop, session-lifecycle, and `SessionEventMap` changes update TypeScript and Python SDK expected outputs in the same PR (`AGENTS:164`).
- **Externally perceptible breaking changes** get an upgrade guide in the same change, not at release time (`AGENTS:11`, `.agents/skills/dsh-create-upgrade-guide/SKILL.md:8,12-20`).
- **Application launch:** only `dsh` profiles launch supported Node apps; package bins, demos, and public SDK argv escapes are forbidden (`AGENTS:13`, `ARCH:43-45`).

## 5. Error handling and typing

- Expected failures get declared types, stable discriminants, and handling-relevant details; never route handling by parsing messages (`ERR:12`).
- Document handling and reporting owners, containment, and guarantees in the owning API: valid invariants and absent/partial/committed/unknown effects (`ERR:16`).
- Catching limits exception propagation, not mutations; only the affected state's owner can establish safe continuation, otherwise stop dependent work, discard invalid state, or escalate. Logging alone is not recovery; retries need safe repetition, cancellation, and an owner (`ERR:18`).
- Every final report needs a readable summary, affected operation, and safe next action; localize through the receiving application's locale mechanism; never claim success, rollback, or safe retry without guarantees (`ERR:22`, `ERR:24`).
- Verify resulting state and visible outcomes, not that an exception was caught (`ERR:26`).
- An empty `catch` names the error and why; keep its `try` to one statement (`AGENTS:152`).
- **No new assertions to `unknown`** (`as unknown` or `<unknown>`, tests included). Existing casts are an exact path+token baseline that may only shrink; `--prune` never adds exceptions (`AGENTS:148`, `.agents/notes/implemented/process/2026-09-19-no-unknown-casts.md:15,19`).
- Everything compiles under `strict: true` (`tsconfig.base.json:19`, `AGENTS:177`); `noUncheckedIndexedAccess` is on (`tsconfig.base.json:20`).

## 6. Comments, prose, and documentation

- Write enough to preserve the contract, then remove reasoning transcripts, repetition, and decoration. Comments state non-obvious contracts or rationale code cannot express (`PROSE:8,12`).
- Preserve the complete proposition: actor/action, condition/timing/ordering, modality, negative guarantee and exception, ownership/side effect/failure mode/consequence (`PROSE:30-38`). A smaller word count alone is not an improvement (`PROSE:38`).
- Required coverage by location: public JSDoc (returns, throws, side effects, ownership, timing, cancellation, durability), internal comments (invariants, race ordering, security boundaries), module comments, tests (non-obvious design only), cookbooks, READMEs, Agent Notes, postmortems, skills, examples/config, prompts and visible strings, diagnostics (`PROSE:44-59`).
- `contract`, `boundary`, `shape`, `surface`, `seam`, `gate`, `vocabulary` are terms to check, not banned words: name the exact fields, validation, timing point, or failure state when it exists (`AGENTS:179`, `PROSE:10`).
- **Ban the ambiguous origin token** `prove`+`nance` in any case variant, in prose, identifiers, paths, and filenames; assert `AGENTS:154` and `.agents/notes/implemented/process/2026-08-26-ban-ambiguous-origin-label.md:15-19`.
- **One physical line per paragraph** (`verify-md-wrap`): use editor soft-wrap; tables, code blocks, and lists keep their formatting (`DOCS:42`).
- **One home per fact:** each fact lives in the tier that owns it and other tiers link there — root `AGENTS` (standing orders), subtree `AGENTS` (subtree orders), `ARCH` (map), subsystems (types/semantics), Agent Notes (rationale), defensive-patterns (review rules), postmortems (incidents), cookbooks (procedures), package READMEs (per-package contract), generated reference (regenerated), skills (workflows) (`DOCS:19-36`).
- Generated reference (catalogs, `cordis-surface` regions) is regenerated from source, never hand-edited; Chinese counterparts follow pairing only (`DOCS:33`, `AGENTS:181`).
- Word budgets live in `scripts/doc-budgets.manifest.json`; the gate rejects excess or missing files. Relocate, condense, then raise with justification in the PR diff; ceilings are guardrails, not reduction targets (`DOCS:51-59`).
- The slop checklist applies to any doc: duplicated rules, history outside its tier, implementation-status annotations, hand-restated catalogs, reasoning transcripts, paragraph walls, emphasis inflation, spec-speak in implemented notes (`DOCS:61-73`).
- Repository references: relative Markdown links for current files, tags/PR numbers for history; `verify-md-links` and `verify-repository-references` enforce targets and forbid hex-letter commit ids (`DOCS:77`).
- Docs accompany every code change: update the affected README/JSDoc contract together (`AGENTS:181`, `PKG:27`).
- Client UI copy is locale-owned: typed dictionaries plus `t` or localized props; `verify-client-ui-i18n` rejects hardcoded copy; English copy (including `meta.title`/`meta.description`) uses sentence case (`AGENTS:159`, `PROSE:58`).
- `dsh-translate-docs` runs only on explicit user invocation (`AGENTS:181`, `DOCS:45`).
- Keep comments local: do not restate code, expand unrelated comments, or explain distant behavior without local need (`AGENTS:153`).
- Prefer symmetry for parallel values; unexplained asymmetry signals a missed extraction (`AGENTS:155`).
- TODO markers carry urgency: `FIXME` blocks a release, `TODO` should be fixed soon, `XXX` may be fixed someday (`AGENTS:168`, `docs/development.md:203-209`).

## 7. Tests and evidence

- Apply the testing policy (`AGENTS:161`). Tests describe behavior, not correctness: change obsolete behavior together with its tests and explain why in the PR (`AGENTS:156`).
- `pnpm run test:coverage`, not `test`, is the CI coverage gate: per-file 100% on `packages/*/*/src`; an uncovered line is usually dead code to delete, not a test to bolt on (`AGENTS:120`, `docs/testing.md:10`).
- Every non-trivial model- or product-user-visible change updates a keyless recorded-session snapshot in the same change (`AGENTS:161`, `docs/testing.md:14,55`).
- Snapshot placement: only session-driven cases belong under top-level `snapshots/`; other expected output stays with its owning app/script/package (`snapshots/AGENTS.md:3`).
- Snapshot identity: canonical parent `session[.vN].jsonl`, children `session.<ordinal>[.vN].jsonl`, v0 omits `.v0`; replay/record/refresh select the numerically highest generation; recording never renames or deletes a committed generation; the owner alone records its role (`snapshots/AGENTS.md:7`).
- Committed sessions are normalization fixed points: volatile identities become typed relationship-preserving tokens; never redact arbitrary text merely because it resembles an identifier (`snapshots/AGENTS.md:11`). A mutating scenario commits the complete `workspace.expected/` oracle, which record/refresh never rewrite (`snapshots/AGENTS.md:15`).
- Fixtures replay on macOS and Linux: fix fixtures, not normalizers (`AGENTS:161`).
- Product-visible plugins require a non-unit REAL-composition test through Loader/app/process; hand-built `ctx.plugin(...)` suites are insufficient; keep opt-ins out of shipped defaults (`PKG:7`, `docs/testing.md:39`).
- Plan unit, e2e, and snapshot coverage for capability seams, lifecycle paths, and transcript output; include missing snapshot-harness support in the same change (`AGENTS:163`).
- Specs run concurrently in forked workers: own every port, path, and child process through teardown; a spec that passes only alone is a defect in the spec (`PKG:20`, `docs/testing.md:21`).
- Never default to the full suite and never repeat a passing check for commit or push; CI owns exhaustive coverage and the platform matrix (`AGENTS:119`).
- Artifact discipline: develop with `build:artifacts`; before claiming completion run `build:check` after the latest `build:artifacts`, or `build` (`AGENTS:121`).

## 8. Agent Notes: when, how, archive

- Write one only for lasting decision rationale that code, tests, and existing docs do not explain; a proposal for substantial future work starts in `proposed/`, a made decision in `implemented/` (`NOTES:46`). Mechanical or local edits — including local UI presentation — are exempt (`AGENTS:157`, `NOTES:48`).
- Path encodes both axes: `{lifecycle}/{class}/yyyy-mm-dd-topic-title.md`, date = first proposed per git history; class comes from the closed set in `scripts/agent-note-tree.ts` — `feature`, `bug-fix`, `simplification`, `architecture`, `process`, `testing` (`NOTES:9,17,23-34`).
- Update the note that already owns the decision instead of duplicating it (`NOTES:48`). An implemented note is kept current with paths, symbols, defaults, and mechanisms in the same change; never append change history, and never rewrite the decision itself — a reversal needs a new note plus cross-link (`IMPL:7,13`).
- **Every new note triggers a supersession check:** search the active tree for older notes on the same decision, classify full or partial supersession with `dsh-archive-agent-notes`, and archive every qualifying implemented triplet in the same PR (`.agents/notes/AGENTS.md:5`).
- Header block is exact: `# Agent Note: <title>`, blank line, `Status: <proposed|implemented|rejected — why>`; the status must agree with the folder (`NOTES:60-74`).
- Body skeleton: `## Problem` first; implemented adds `## Decision` and `## Consequences`; proposed uses `## Proposal`, `## Acceptance criteria`, `## Risks`; `## Alternatives considered` is mandatory and records real alternatives, never invented ones (`NOTES:78,95-117`). Proposal-era headings (`## Proposal`, `## Plan`, `## Migration plan`, `## Acceptance criteria`) are rejected in implemented notes (`NOTES:103`).
- Cross-references use relative Markdown links, never bare prose or numbers (`NOTES:17`).
- Archive only a complete implemented note whose rationale no longer guides future work; keep it active when its alternatives, ownership boundary, negative guarantee, durable/wire semantics, security rule, or reintroduction condition still matters (`NOTES:38`). The archive triplet is `archived/{class}/...` plus `.zh.md` and `.i18n.yaml`, gets an `Archived: YYYY-MM-DD` line, and is then permanently frozen — never edit, translate, reformat, move, or cite as current authority (`NOTES:40-42`, `AGENTS:157`).
- Delete (with the whole triplet and inbound-link repair) notes that only describe small UI adjustments or purely mechanical changes; never archive a proposed note — reject it (`NOTES:38`).

## 9. PR description, labels, history, AI declaration

- Description has exactly four second-level headings in order: `## Motivation`, `## Changes`, `## Testing`, `## AI Usage` (`PRDESC:19`, `.github/pull_request_template.md:3,7,9,20`). Fixed section labels stay English; body language is Chinese unless a human asked otherwise (`PRDESC:21`).
- Motivation: one sentence plus at least one same-repository Issue reference — `Fixes/Closes/Resolves #N` when resolving, `Refs #N` for context; PR numbers, HTML comments, code fences, and inline code do not count (`PRDESC:25-26`).
- Changes: interface changes (commands, flags, config keys, env vars, public exports, plugin registration values, protocols, persisted formats) and behavior changes (observable defaults, performance, timing, output), each `None` when empty; docs/instruction changes count as behavior for their readers; state only behavior the diff guarantees and tests cover (`PRDESC:30-32`).
- Testing: test design first (behavior matrix for behavior changes, before/after measurements with conditions for performance, unchanged-behavior proof for refactors, content checks for docs), then one entry per test method with the visible command and result, stating local vs CI; only tests that actually ran may be listed; long evidence goes in the entry's `<details><summary>Proof</summary>` block (`PRDESC:38-53`).
- Change-specific disclosures sit in the section they concern after a bold English label: changed existing-test behavior (why), each raised doc-budget ceiling with old/new values, a GUI demonstration GIF (or why none), and a translation term outside the terminology list with its source (`PRDESC:55-64`).
- AI Usage: levels ordered by AI involvement — `hint`, `assist`, `pair`, `copilot`, `auto`, plus `n/a` — each recorded as a multiple of 5% within the level's range; stages fixed in order — `breakdown`, `design`, `testing`, `implementation`, `review`; badge and declaration line carry the highest stage level; specification pinned `v0.1.2` (`PRDESC:70-130,134,146-168`).
- The AI Usage table is rewritten to cover all work so far, never appended as history; the review row is `n/a` until a review comment has actually been handled; after later changes, regrade stages the later work changed (`PRDESC:170-176`).
- Create/update via a git-ignored body file (`gh pr create --body-file` / `gh pr edit --body-file`); on update preserve author-written content and media, replace only the `ai-declaration` block contents, and keep exactly one AI Usage section (`PRDESC:202-204`).
- **Labels:** exactly one canonical `kind/*` from the closed set (`kind/feature`, `kind/bug-fix`, `kind/doc`, `kind/testing`, `kind/cleanup`, `kind/dependency`) and at least one materially affected `area/*`; no umbrella-plus-narrower pair for one change; a genuinely new durable domain may add a concise `area/<kebab-case>` label and must report it (`AGENTS:166`, `LABELS:15,19-32,34-44`). Retired aliases (`kind/bug`, `feature`, `ci`, `cli`, …) are reserved and rejected (`LABELS:32`).
- Issue policy: eligible PRs need at least one same-repository Issue reference, exactly one `kind/*`, at least one `area/*`, and at most one `p0`–`p3`; unsupported kinds, retired aliases, and `source/*` labels fail validation (`.github/issue-management/README.md:31`). Issues use native Issue Type instead of `kind/*` (`LABELS:48`).
- Merge authority: branch protection requires the single check `all checks passed` from `ci.yml`, with `windows checks passed` and `python checks passed` contributed by the separate workflows (`.github/workflows/ci.yml:549-556`); approval needs 2 weighted points (`.github/review-ownership/approval-policy.json:2-3`, `.github/review-ownership/README.md:21-25`).
- **Stacks:** every same-repository chain of two or more dependent PRs must use GitHub's official stack object before landing; land with `gh stack merge <stack-number> --yes --merge`, and a partial landing needs an explicit boundary PR — never fall back to per-PR `gh pr merge` plus manual retargeting (`STACK:15-17`).
- **Refresh history:** merge-forward and rebase are both allowed, including after review; a rewrite uses an exact lease or the lease-protected `gh stack` push path and aborts on remote movement; raw `--force` is forbidden (`AGENTS:165`, `STACK:19`).
- `gh stack sync` is the one ordering exception (fetch, cascade-rebase, push as one operation): validate every rewritten layer immediately and merge nothing until that evidence passes (`STACK:21`, `AGENTS:116`).
- Choose PR history deliberately: split independent changes and fix the introducing PR before propagation (`AGENTS:165`).
- No commit-message format rule exists in this rule surface (no rule in `AGENTS`, `docs/`, skills, or process notes; the controlled artifact is the PR description and branch history) — **unverified as an absence**, but nothing in the checked sources requires a subject convention.

## 10. Never do (hard list)

1. Never use raw `--force`; rewrites use `--force-with-lease` or `gh stack` and abort on remote movement (`AGENTS:165`, `STACK:19`).
2. Never edit, translate, reformat, move, or cite a note under `.agents/notes/archived/` as current authority (`NOTES:42`, `AGENTS:157`).
3. Never rename, overwrite, or delete a committed Session generation, and never bump `SESSION_FORMAT_VERSION` to make a failing test green (`AGENTS:7`, `AGENTS:135`, `ARCH:128`).
4. Never add a new `as unknown` / `<unknown>` assertion, in tests included (`AGENTS:148`).
5. Never introduce module-level singleton state, a global `current`/`active`/`selection`, or a `getInstance()` owner (`PKG:13`, `CORDIS:27`).
6. Never launch a Node application outside a `dsh` profile — no package bins, demos, or public SDK argv escape (`AGENTS:13`).
7. Never commit credentials or a real `.env` (`AGENTS:128`).
8. Never hand-edit generated catalogs or `cordis-surface` regions (`DOCS:33`).
9. Never disable a rule globally to pass; use narrow, justified exceptions (`AGENTS:179`).
10. Never add runtime validation, fallbacks, or hostile-input tests for values a typed same-process interface already requires (`AGENTS:147`).
11. Never return from a waterfall listener without calling `next()` (`AGENTS:137`).
12. Never report checks or tests as run when they were not; report only commands actually run (`AGENTS:116`, `AGENTS:181`).
13. Never mix the source plane and the artifact plane in one verification story (`AGENTS:149`).
14. Never route error handling by parsing messages, and never treat logging as recovery (`ERR:12,18`).
15. Never land a native stack with per-PR merges and manual retargeting (`STACK:17`).
16. Never skip an upgrade guide for an externally perceptible break (`AGENTS:11`).
17. Never put `kind/*` labels on Issues or `source/*` labels on PRs (`LABELS:48`, `LABELS:32`).
18. Never edit `CLAUDE.md`; it symlinks `AGENTS.md` — edit the real file (`AGENTS:185`).

## 11. Before touching X, read Y

| Touching | Read first |
|---|---|
| Anything under `packages/` | `AGENTS:3`, `ARCH:5` (whole map), `DEF:17-23` |
| A package surface, exports, build faces, dependency declarations | `DEF:19` → `docs/defensive-patterns/package-surface.md`; `PKG:5-6,24` |
| A remote service, `@Remote` method, API dispatch | `DEF:20` → `docs/defensive-patterns/remote-and-api.md` |
| Client components, slots, stores, hooks, effects | `DEF:21` → `docs/defensive-patterns/client-components.md`; `AGENTS:160` + `dsh-client-ui-ux` |
| Session reads, retention, conversation nodes, renderers | `DEF:22` → `docs/defensive-patterns/conversation-and-session.md` |
| Timing, shared ownership, migrations, disposal, subprocesses, performance evidence | `DEF:23` → `docs/defensive-patterns/general.md`; `CORDIS:25-43` |
| A session event, `SessionEventMap` member, or projection | `PROJ:10-32`; `ARCH:124-132`; `AGENTS:135,138` |
| Persisted formats, durable user data, SQLite | `docs/session-format-status.md:20-24`; `docs/cookbook/reviewing-persistence-type-changes.md`; `AGENTS:7-9` |
| A model-facing tool, schema, prompt, or skill | `AGEXP:6-19`; `PROSE:44-59`; `AGENTS:162` |
| Markdown, README, JSDoc, diagnostics | `PROSE`; `DOCS:15-73` |
| An Agent Note (new, moved, or archived) | `NOTES`; `IMPL`; `.agents/notes/AGENTS.md:5` |
| A PR description or label set | `PRDESC`; `.github/pull_request_template.md`; `LABELS` |
| Any breaking external surface | `.agents/skills/dsh-create-upgrade-guide/SKILL.md`; `AGENTS:11` |
| `vendor/*` | `AGENTS:189`; `vendor/README.md` |
| A CI workflow or gate | `.github/AGENTS.md`; `scripts/AGENTS.md` |
| A new dependency or a hand-rolled replacement | `.agents/skills/dsh-find-simplifications/SKILL.md:51`; `AGENTS:142` |
| Deleting or simplifying behavior | `SIMP:31-41`; `DEF` |

## 12. Evidence commands by surface

| Change surface | Evidence |
|---|---|
| Package behavior | owning Vitest file or focused test name |
| Coverage-sensitive source | `pnpm run test:coverage` (per-file 100% `packages/*/*/src`) |
| Model-, CLI-, editor-, terminal-visible output | owning keyless snapshot or runnable example (`test:snapshot`, `test:web`) |
| Docs, notes, catalogs, doc-linked comments | `pnpm run doc-sync` (`test:docs` for the quick aggregate) |
| Public exports, manifests, build/worker/bin entries | `pnpm run build`, plus `publint`/`hygiene` and the owning built smoke |
| Types in tests/scripts/benchmarks | `pnpm run build:check` after the latest `build:artifacts` |
| Real provider or agent behavior | owning `pnpm run test:e2e` target when a key exists |
| Windows-only failure | `pnpm run check:windows-wine`, diagnosis only — CI owns the signal (`AGENTS:100`) |
| Outgoing diff scope | `pnpm run change-scope --base <verified-ref>`, then `dsh-pre-push-checks` |

## Gaps in the rule surface (verified absences)

1. No commit-message or subject convention is stated anywhere checked; history control is expressed through PR/stacks rules, not commit text.
2. No CODEOWNERS file or reviewer-onboarding document exists at this commit; reviewer authority is defined operationally by weighted approval points (`.github/review-ownership/approval-policy.json`).
3. Branch-name conventions are not stated as policy; a lowercase-hyphenated descriptive name appears only as a tool default in the generated `docs/tool-catalog.md:2524` — **(unverified)** as contributor policy.
