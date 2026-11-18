# Orchestration, interaction, contributor process

Snapshot taken 2026-11-03 from `master` at root version `0.2.2-alpha.2`. Paths are repo-relative; every claim below was read from the file it cites. Items that a checkout cannot settle are marked **(unverified)**.

## One-line purpose

How an agent plans, delegates, schedules, and reports work at runtime (goal / plan / todo / schedule / subagent / jobs / workflow / guard / preset / skill / interaction), plus exactly what a contributor must do to land a change — including the hard external-contribution gate.

## Package inventory

16 groups, 111 packages in this slice. `ctx.*` keys are the composition seams; a package that registers nothing is a Composition/Consumer plugin.

| Path | Package name(s) | Role | Key src files |
|---|---|---|---|
| `packages/goal/goal/` | `@deepseek-ai/dsh-goal` | One durable goal per session; `ctx.goals` (`GoalService`), CAS on revision | `src/{domain,runtime,fold,client,types}.ts` |
| `packages/goal/tool-goal/` | `dsh-tool-goal` | Model tools `create_goal` / `get_goal` / `update_goal` (+ blocked authority) | `src/{authority,wrapup,index}.ts` |
| `packages/goal/goal-round-driver/` | `dsh-goal-round-driver` | Continues an armed goal while idle; no config of its own | `src/{index,prompt}.ts` |
| `packages/goal/command-goal/` | `dsh-command-goal` | `/goal` slash command (no model turn) | `src/index.ts` |
| `packages/plan/plan-mode/` | `dsh-plan-mode` | Plan mode, `/plan` command, `exit_plan_mode` tool (`EXIT_PLAN_MODE`) | `src/{index,types,client}.ts` |
| `packages/todo/tool-todo/` | `dsh-tool-todo` | `todo_write` whole-list replacement tool + todos projection | `src/{index,types,client}.ts` |
| `packages/schedule/schedule/` | `dsh-schedule` | RFC 5545 tasks; `ctx.schedule` (`ScheduleService`), durable storage, delivery history | `src/{runtime,domain,storage,update,delivery-history,client}.ts` |
| `packages/schedule/tool-schedule/` | `dsh-tool-schedule` | `schedule_create` / `schedule_edit` / `schedule_list` / `schedule_view` | `src/index.ts` |
| `packages/subagent/subagent/` | `dsh-subagent` | Delegation seam; `ctx.subagents` (`SubagentRuntime`) | `src/{child-agent,activation,control,depth,catalog,descriptor}.ts` |
| `packages/subagent/subagent-{spawn,fork}-in-process/` | `dsh-subagent-spawn-in-process`, `-fork-in-process` | Fresh vs history-seeded in-process children | `src/index.ts` |
| `packages/subagent/subagent-{acp,codex,claude-code,dsh-sdk}/` | `dsh-subagent-*` | Out-of-process providers (ACP, Codex app-server, Claude Agent SDK, TS SDK) | `src/index.ts` |
| `packages/subagent/tool-subagent/`, `tool-subagent-control/` | `dsh-tool-subagent`, `-control` | `subagent`, `list_subagent_models`; `list_agents`, `send_message`, `interrupt_agent` | `src/index.ts` |
| `packages/jobs/jobs/` | `dsh-jobs` | Registry contract; `ctx.jobs` (`JobRegistry`), ownership, output ring | `src/{index,types,view,brand,archive-admission}.ts` |
| `packages/jobs/jobs-local/` | `dsh-jobs-local` | In-process execution provider (concurrency, retain-byte caps) | `src/{index,pump,ring,events}.ts` |
| `packages/jobs/tool-jobs/` | `dsh-tool-jobs` | `job_output` / `job_kill` / `job_list` + completion notices | `src/{index,render}.ts` |
| `packages/workflow/workflow/` | `dsh-workflow` | Workflow capability; `ctx.workflowEngine` (`WorkflowEngine`) | `src/{index,types,runtime-types}.ts` |
| `packages/workflow/workflow-ptc/` | `dsh-workflow-ptc` | Sandboxed Node process engine (shared with PTC `run_code`) | `src/{index,host,guest,realm,meta}.ts` |
| `packages/workflow/tool-workflow/` | `dsh-tool-workflow` | `workflow` tool (meta/script/args/`run_in_background`) | `src/{index,record,types}.ts` |
| `packages/guard/repeat-tool-reminder/` | `dsh-repeat-tool-reminder` | Advisory nudge at 3/5/8 identical tool calls; enabled in base bundle | `src/index.ts` |
| `packages/guard/timeout-policy/` | `dsh-tool-call-timeout-policy` | Cooperative per-tool call timeout → model-visible timeout error | `src/index.ts` |
| `packages/extensions/cordis-{host,client}-runner/` | `dsh-cordis-host-runner`, `dsh-cordis-client-runner` | Runtime self-modification: `node:vm` host half, browser half + approval UI | `src/{registry,sandbox,lifecycle,inspect-registry,guard}.ts` |
| `packages/extensions/tool-cordis/`, `ui-cordis/` | `dsh-tool-cordis`, `dsh-client-ui-cordis` | Read-only runtime API discovery for agents | `src/{host,api-catalog,providers}.ts` |
| `packages/preset/agent-preset/`, `agent-preset-registry/` | `dsh-agent-preset`, `-registry` | Presets as Cordis YAML; `ctx.agentPresets`; per-session revision selection | `agent-preset/src/index.ts`; `agent-preset-registry/src/{preset,session,mount,composition-inventory}.ts` |
| `packages/preset/persona/` | `dsh-persona` | Per-agent system-prompt prefix/suffix row inside a preset | `src/index.ts` |
| `packages/skill/{skill,skill-filesystem,skill-office,tool-skill,tool-workspace-dependencies}/` | `dsh-skill*`, `dsh-tool-skill` | Skill registry `ctx.skills`, local discovery, `skill` tool + `/name` invocation | `skill/src/index.ts`, `tool-skill/src/index.ts` |
| `packages/interaction/commands/` | `dsh-commands` | Human `/command` registry; `ctx.commands`; never enters model history | `src/{index,types,builtin,brand}.ts` |
| `packages/interaction/user-questions/`, `tool-ask-user/` | `dsh-user-questions`, `dsh-tool-ask-user` | `ask()` / `askTimed()` waterfall + `ask_user_question` tool | `src/{index,projection,timed-wait,types}.ts` (+ `tool-ask-user/src/timed.ts`) |
| `packages/interaction/user-approval/`, `permission-presets/` | `dsh-user-approval`, `dsh-permission-presets` | One-shot fail-closed approval seam; sandbox+approval presets | `src/{index,types}.ts` |
| `packages/experimental/` | 65 packages (`dsh-experimental-*`, `dsh-cua*`, `dsh-hook*`, `dsh-webhook*`, …) | Pre-stable prototypes, no product-support commitment | `packages/experimental/README.md`; policy in `scripts/experimental-package-policy.ts` |
| `packages/feedback/{message,command}-feedback/` | `dsh-message-feedback`, `dsh-command-feedback` | Session-log ratings/notes; `/feedback`; never enters model history | `src/{index,types}.ts` |
| `packages/telemetry/otel/` | `dsh-otel` | `ctx.otel` channels (exporter, resource, scope, queue per channel) | `src/{index,transport,event-transport,event-log,session-log}.ts` |
| `packages/identity/anonymous-user-id/` | `dsh-anonymous-user-id` | `$DSH_HOME/.anonymous-user-id`, one UUID per harness home | `src/index.ts` |

Interfaces live outside the package: `packages/core/` owns the agent loop and tool registry, `packages/bundle/{base,headless,web-app,acp-app,sdk-app,sdk-minimal}/` are the shipped compositions. `docs/subsystems/{goal,plan,todo,schedule,jobs,workflow,subagent,skills,commands,approval,feedback,otel,extensions}.md` are the reference pages per subsystem.

## Subagent / workflow / jobs / goal / plan / schedule mechanisms

**Subagent** (`ctx.subagents`, `SubagentRuntime`). Providers register on the seam and are selected by name in config; `tool-subagent` defaults `toolName: 'subagent'`. In-process `spawn` children start fresh, `fork` children are seeded from the parent's completed history; both keep durable Sessions and stay addressable for later messages (`send_message`, `interrupt_agent`, `list_agents`). ACP / Codex / Claude Code / DSH-SDK children execute once and are not continuable. Every child shares admission, cancellation, ownership, and discovery; delegation depth is bounded in `subagent/src/depth.ts`. Continuable children are also what experimental Agent Teams (`packages/experimental/agent-team/`, `ctx.agentTeams`) builds its roster and task board on.

**Workflow** (`ctx.workflowEngine`). A model-authored plain-JavaScript body with `meta {name, description, whenToUse, phases}`; hooks are `agent()`, `parallel()`, `pipeline()`, `phase()`, `log()`, plus the `args` global. `workflow-ptc` runs it in fresh Node processes under the calling Session's file sandbox — the same execution provider that serves PTC `run_code` and the opt-in Ralph loop. Foreground calls wait and return `{ kind: 'foreground', runId, agentsStarted, result }`; `run_in_background: true` registers an owned `workflow` job on `ctx.jobs` and returns `{ kind: 'background', jobId, runId }`. Failure and cancellation return an error string, never partial success. Only run/member lifecycle enters the session log; `phase()`/`log()` lines are transient and reach humans through the job ring.

**Jobs** (`ctx.jobs`, `JobRegistry`). Ids are `<kind>-<short-uuid>`; ownership is the agent session, so another agent cannot read or stop the job. The registry keeps an output ring with separate unread/settled retention, exposes an event stream, and delivers completion as an in-session notice instead of polling. `jobs-local` executes in-process with configurable per-owner concurrency and retain bytes (`DEFAULT_MAX_CONCURRENT_JOBS_PER_OWNER`, `DEFAULT_RETAIN_BYTES`, `DEFAULT_SETTLED_RETAIN_BYTES`, `DEFAULT_PUMP_POLL_MS`); jobs end when their owner or the harness shuts down. Tools: `job_output` (optional wait), `job_kill`, `job_list`.

**Goal** (`ctx.goals`, `GoalService`). Exactly one current goal per session, durable across resume, fork, and restart; agents use `create_goal`/`get_goal`/`update_goal`, humans use `/goal`. Updates are compare-and-set on a revision, so stale views are rejected. A configurable round cap (default 256) bounds automatic continuation; only rounds that reach model history consume allowance. `goal-round-driver` continues while the agent is idle, continuation is armed, and allowance remains; exhaustion records a blocker. The goal stores state and never schedules work.

**Plan** (`dsh-plan-mode`). `/plan [off|message]` enters/leaves; `exit_plan_mode` presents the finished plan for approval, and a rejection returns feedback for more planning. Deployment-written guidance shapes behavior, but every tool stays available — limits come from sandbox mode and approval policy, not plan mode. Active state survives resume and forks; the switch is recorded in the session log and applies from the next step when queued.

**Schedule** (`ctx.schedule`, `ScheduleService`). RFC 5545 recurrence; delivery targets an existing conversation, one reused conversation, or a new conversation per run. Tasks survive Host restarts but need a running Host; after downtime a recurring task delivers only its latest missed occurrence. Model tools: `schedule_create`, `schedule_edit`, `schedule_list`, `schedule_view`; humans use the sidebar Automation tasks page.

### Supporting plugins (guard, preset, skill, interaction, experimental, feedback, telemetry, identity)

- **Guard**: two advisory/cooperative plugins, both enabled in the `dsh` base bundle — `repeat-tool-reminder` (nudges at 3/5/8 identical calls, never blocks) and `timeout-policy` (per-tool cooperative limit, returns a settled timeout error to the model; cannot hard-stop a tool that ignores cancellation).
- **Preset**: `agent-preset` declares per-agent child plugins in ordinary Cordis YAML, `agent-preset-registry` (`ctx.agentPresets`) loads them eagerly, selects one per session, and tracks runtime revisions, and `persona` gives one agent its own prompt prefix/suffix (mount only inside a preset — a global mount collides with the prompt registry and fails loud).
- **Skill**: `skill` (`ctx.skills`) merges providers, `skill-filesystem` discovers local directories, `skill-office` adds Word/PowerPoint/Excel workflows, `tool-skill` exposes the `skill` tool plus `/name` direct invocation. This session's own skill catalog comes from this family.
- **Interaction**: `commands` (`ctx.commands`, human `/command` actions that never become a model message), `user-questions` (`ask`/`askTimed` waterfall; `ask_user_question` tool), `user-approval` (one-shot, fail-closed: missing answerer or failure ⇒ `unavailable`), `permission-presets` (sandbox + approval chosen together).
- **Extensions**: `cordis-host-runner` runs dynamic Host halves in a `node:vm` realm and keeps process-local definitions; `cordis-client-runner` runs browser halves behind an approval UI; `tool-cordis` is read-only API discovery. No model tool creates dynamic definitions — persistent plugins go through Plugin Manager (`packages/boot/plugin-manager/`).
- **Experimental** (65 packages): pre-stable prototypes with no product-support commitment; naming/publication follow `scripts/experimental-package-policy.ts`, and experimental capabilities ship as optional, switched-off bundles. Includes Agent Teams (`agent-team`, `tool-agent-team`, `client-ui-agent-team`), Forge, hooks/webhook protocols, browser/computer use, Liveshare, Inspector, Ralph, worktrees.
- **Feedback / telemetry / identity**: `message-feedback` and `command-feedback` write ratings and session remarks to the canonical session log only (never model input). `otel` creates independent OTLP channels with per-channel exporter, resource, scope, and queue; mounting sends nothing. `anonymous-user-id` is one random UUID per `$DSH_HOME` (`~/.dsh`), attached to telemetry, feedback, and DeepSeek requests for installation-scoped correlation.

## Contributor workflow (setup, checks, gates, PR/issue policy, AI declaration)

**Current external-contribution policy — the headline finding.** `CONTRIBUTING.md:9` states plainly that the project **cannot accept external pull requests at the moment**, in both languages (`CONTRIBUTING.zh.md:11`). `CONTRIBUTING.md:11` and `README.md:45` direct bug reports and feedback to **GitHub Discussions**, not Issues; upvote/comment there, since the team is small and triages Discussions when allocating resources. The suggested ways to contribute without code: publish a plugin and tag the GitHub project with the `dsh-plugin` topic, write blog/how-to posts, answer community questions. Issues are the *maintainer* channel: `.github/ISSUE_TEMPLATE/{bug,feature,task}.md` with native Issue Types, `blank_issues_enabled: false` (`.github/ISSUE_TEMPLATE/config.yml`), and the required `Issue policy` workflow. Whether an external account is allowed to open an Issue at all is a repository setting **(unverified from the checkout)**; the documented channel for outsiders is Discussions. There is no `SECURITY.md`, `CODE_OF_CONDUCT.md`, or governance file at the root (checked); `SAFETY.md` is only the experimental-preview disclaimer, so a security-disclosure route is **undocumented (unverified)**.

**Setup** (`docs/development.md`): Node ≥ 24.9 with TypeScript type stripping (CI: 24.9, latest 24, 26), Corepack pnpm pinned `pnpm@11.28.5`, Git ≥ 2.26. `pnpm install` also installs worktree-local Lefthook hooks via `scripts/install-lefthook.mjs` (postinstall; rerun manually if cached). Setup is complete when `pnpm run typecheck` passes.

**Day-to-day loop** (as the repo intends it): branch → make the change → run the owning focused test → `pnpm run change-scope --base <verified-ref>` → run only the checks the scope needs (table above / `dsh-pre-push-checks`) → commit (hooks fix staged lint and whitespace) → push (pre-push typecheck) → PR description with all four sections and the AI Usage table → CI owns the matrix. Docs-only changes: `pnpm run doc-sync`. Changes that touch built output: `pnpm run build`. Do not repeat a passing check merely because a push follows.

**Local hooks** (`lefthook.yml`): pre-commit = translation pairing on staged `*.i18n.yaml`, archived-note gate, staged Oxlint (`--fix`, `.oxlintrc.staged.json`), `git diff --cached --check` whitespace, pi-ai provider metadata, vendor manifest guard; pre-merge-commit = pairing + archived notes; pre-push = `pnpm run typecheck`. Hooks deliberately run no tests, snapshots, docs, or builds — the contributor picks relevant checks ([`dsh-pre-push-checks`](.agents/skills/dsh-pre-push-checks/SKILL.md)), using `pnpm run change-scope --base <ref>` to enumerate the outgoing scope. `pnpm run check:all` is an opt-in full local rehearsal, not an instruction.

**PR/merge obligations** (maintainer path): at least one same-repository Issue reference, exactly one `kind/*` label, at least one `area/*`, at most one `p0`–`p3`; resolving references (`Fixes #123`) additionally require matching Project Priority (`.github/issue-management/README.md`). Approval is weighted: `2` points required, named reviewers worth 2, other write-capable reviewers 1, plus small author credit (`.github/review-ownership/approval-policy.json`). Descriptions use exactly four sections — `## Motivation`, `## Changes`, `## Testing`, `## AI Usage` — where AI Usage pins AI-DECLARATION spec `v0.1.2` with a badge and one row per stage (breakdown / design / testing / implementation / review) at levels `hint` / `assist` / `pair` / `copilot` / `auto` plus an involvement percentage (`.agents/skills/dsh-pr-description/SKILL.md`). Stacks use GitHub's native stacked-PR feature (`.agents/skills/dsh-merging-stacked-prs/SKILL.md`).

**Skills** (`.agents/skills/<name>/SKILL.md`, 21 total; only some carry `references/`, `templates/`, or `scripts/`). Load the matching one before acting — several are mandated by `AGENTS.md`:

| Skill | Use it when |
|---|---|
| `dsh-pre-push-checks` | Before pushing/force-pushing/claiming checks pass; selects the smallest covering checks |
| `dsh-pr-description` | Creating or updating a PR description (four sections + AI Usage declaration) |
| `dsh-merging-stacked-prs` | Landing an A←B←C PR stack; requires GitHub's native stacked-PR feature |
| `dsh-code-review` | Reviewing a PR against this repo's standards, ADRs, and gates |
| `dsh-prose-standard` | Any prose, JSDoc, comment, prompt, diagnostic, or UI string decision |
| `dsh-doc` | Creating/restructuring/auditing Markdown docs, package READMEs, website pages |
| `dsh-translate-docs` | Manually running the bilingual workflow (only on explicit user invocation) |
| `dsh-archive-agent-notes` | Adding/auditing/archiving Agent Notes (supersession + frozen archive rules) |
| `dsh-create-upgrade-guide` | A change breaks an externally perceptible surface, or extends an unreleased guide |
| `dsh-session-projection` | Creating/extending a session projection or migrating fold state to one |
| `dsh-error-handling` | Designing/reviewing failures, retries, background tasks, user-visible errors |
| `dsh-ci-test-reliability` | Tests that can flake under CI concurrency, ports, clocks, subprocesses, teardown |
| `dsh-client-ui-ux` | Product-user-visible GUI changes: tokens, feedback surfaces, overlays, copy |
| `dsh-responsive-ui` | Responsive layouts, mobile/touch, truncation, focus behavior |
| `dsh-speed-up-perf` | Performance work, synthetic benchmarks, profiling long sessions/Web |
| `dsh-find-simplifications` | Hunting dead/duplicated/speculative behavior, APIs, config, or prose |
| `dsh-official-plugin-artwork` | Official (incl. experimental) plugin icons/artwork; needs designer approval |
| `dsh-trim-cot-leakage` | Prose that reads like leaked reasoning: change narration, review vantage, hedged plans |
| `agent-experience` | Writing model-facing tool definitions, skills, context loading, multi-step prompts |
| `cordis-styling-nitpicking` | Reviewing Cordis plugin lifecycle: singleton state, side effects, cleanup order |
| `record-browser-gif` | Recording a GUI demo GIF (required for product-user-visible GUI PRs) |

**Agent Notes** (`.agents/notes/`). Two path axes: lifecycle and class — `{proposed|implemented|rejected|archived}/{feature|bug-fix|simplification|architecture|process|testing}/yyyy-mm-dd-topic.md`, plus a `.zh.md` counterpart and `.i18n.yaml` sidecar per note. Counts now: implemented 345, proposed 46, rejected 8, archived 927 (English files). `implemented/` is kept current with shipped reality; archived is frozen and machine-guarded by a manifest. Format body: `## Problem` then lifecycle-specific canonical headings (`## Decision`/`## Consequences` for implemented; `## Proposal`/`## Acceptance criteria`/`## Risks` for proposed) and a mandatory `## Alternatives considered`. Write one only for durable decision rationale; mechanical/local edits are exempt.

## CI lanes and local gates (command → what it covers)

Gates are one scheduler: `scripts/run-gates.ts` (modes enumerated at `gatesForMode`), invoked by `pnpm run check:*`. Aggregates run a dependency graph with `DSH_GATE_CONCURRENCY` (12 locally; `doc-sync`, `test:docs`, `hygiene`, `check:all` cap at 8) and optional `DSH_GATE_FAIL_FAST=1`.

| Command | Covers |
|---|---|
| `pnpm run check:ci:static` | runtime closure, default-product isolation, product-use classification, official bundle catalog, pi-ai provider data, application entrypoints, workspace constraints, package dependency/license/meta, Cordis config, shared hygiene (optional deps, client packages, i18n, client UI i18n, route resolution, no bare dispatcher, plugin-record callers, no unknown casts, no top-level await), approval + issue-management policy tests, `doc-sync`, module graph |
| `pnpm run check:ci:coverage` | `test:coverage:partitioned` — per-file 100% on `packages/*/*/src` split into timings-balanced partitions (`scripts/coverage-partitions.ts`) |
| `pnpm run check:ci:lint:contracts-ready` | Oxlint over the repo + `duplication` (jscpd); CI's `node 24 / lint` job runs `pnpm run typecheck` first |
| `pnpm run check:ci:bench` | `scripts/run-ci-bench.ts`; the required `node 24 / benchmarks` lane |
| `pnpm run check:ci:consumers` | build, `check:node-compat`, publint, snapshots, expected output, `test:web:built` under `DSH_SNAPSHOT=replay`, doc-typecheck, node-next types, built-bin smokes |
| `pnpm run check:ci:snapshot` / `check:ci:artifacts` / `check:ci:unit` | snapshot-only; build-artifact readers; unit suite |
| `pnpm run check:node-compat` | keyless source compat smokes on pinned Node legs (`DSH_NODE_COMPAT_SKIP_TYPECHECK`) |
| `pnpm run check:ci:windows-{blocking,complete,observational-ready}`; `check:windows-wine` | native Windows lanes; Wine diagnosis only |
| `pnpm run doc-sync` (`check:docs`, `test:docs` = `doc-quick`) | ~45 doc gates: doc build, doc-typecheck, md links/wrap, type-equiv, generated catalogs (CLI help, Cordis, tools, config, client, dependency, persistence, session format, module graph), Agent Note format/classification/archive, skill metadata, upgrade guides, doc budgets, translation pairing, repository references |
| `pnpm run hygiene` | publint, vendor rescope, workspace constraints, package deps, npm layout, node-next consumer, optional-dep imports, client package checks |
| `pnpm run test` / `test:coverage` / `test:e2e` / `test:expected` / `test:snapshot` / `test:web` / `test:bench` | unit (vitest), coverage gate, real-API e2e (self-skips without `DEEPSEEK_API_KEY`), owner-local expected output, keyless recorded-session replay, Web/browser snapshots, perf gates |
| `pnpm run build` (`build:artifacts` + `build:check`) | tsc emits `lib/types`, tsdown bundles Host/Client/Web, then aggregate checks; `build:check` alone never rebuilds artifacts |

`scripts/` is the gate corpus itself: 359 entries (330 `.ts`) — `gen-*.ts` generators with a paired `--check` verifier, `verify-*.ts` invariant checks, `run-gates.ts` (scheduler), `build.ts` (artifact graph), `change-scope.ts` (diff scope for check selection), `coverage-partitions.ts` / `coverage-exempt.ts` / `coverage-fork-diagnostics.ts`, `ci-workflow.spec.ts` (workflow declarations), `release/{bump,pack,publish,verify,process,families}.ts`, plus `fixtures/`, `release/`, `snapshots/`, `primary-runtime/`, `dependency-catalog/`. Per `scripts/AGENTS.md`, gate scripts call pnpm shell-free, normalize glob paths to `/`, and every script gets a spec in forked workers.

Workflows (`.github/workflows/`): `ci.yml` (PR only; jobs `node 24 / static`, `/ coverage`, `/ lint`, `/ benchmarks`, `/ snapshots and artifacts`, plus a `node 24.9` + `node 26` matrix and `all checks passed`), `ci-windows.yml` (`windows-build`, `windows-coverage`, `windows-native-tests`, `windows checks passed`), `ci-python.yml` (`python 3.10 / keyless SDK`, `python runtime / release-shaped matrix`, `python checks passed`), `ci-master.yml` (master push/dispatch: ssh-helper, python runtime, Wine Windows, serial self-hosted standbys, benchmark runners), `e2e.yml` (nightly + trusted PRs, real DeepSeek key), `sandbox.yml` (master-only kernel-confinement proofs + darwin unit parity), `release*.yml`, `*-package.yml`/`desktop-publish.yml`, `docs-pages.yml`, `expected-filenames.yml` (rejects tracked non-vendor filenames containing `golden`), `issue-policy.yml`/`issue-lifecycle.yml`, three `Policy` workflows on `pull_request_target` (`pr-check-on-head-branch`, `pr-check-on-base-branch`, `pr-check-after-approve`), `weighted-approval.yml`, and SDK/SSH-helper/native-addon build workflows.

Snapshots (`snapshots/AGENTS.md`): top-level tree only for recorded-session cases through a shipped `dsh` profile — `snapshots/session/`, `sdk/`, `acp/`, `web/`; filenames `session[.vN].jsonl` / `session.<ordinal>[.vN].jsonl`; each scenario declares `snapshot.yml`; a mutating scenario commits the full `workspace.expected/` tree as an independent oracle. Non-session expected output stays in the owning `tests/expected/`. Benchmarks (`benchmarks/AGENTS.md`): one directory per measured user path (`session-open/`, `terminal-io/`, `conversation-fold/`, `agent-continuation/`, `long-session-browser/`, `active-stream-reconnect/`, `session-corpus/`, `user-text/` + `support/`), `*.bench.ts` / `*.bench.client.ts`, timed code under plain Node, budgets in reviewed constants.

Release/versioning: three independent sequences — dsh (`release.yml` pack / `release-publish.yml`, tag `dsh-v<version>`), vendored Cordis (`release-vendor.yml` / `release-vendor-publish.yml`, per-package tags), native (`node-addon-system-release.yml`). Bumps land from a local command (`release:dsh`, `release:vendor`) that writes manifests + lockfile; `release:verify`, `release:pack`, `release:pack`-based `release:verify-packed-install`, then `release:publish` only in GitHub Actions, which compares each tarball against registry versions and `dist.integrity` (skip on match, fail on changed bytes). Externally perceptible breakage requires an upgrade guide at `docs/upgrade-guide/v<version>/<item>/guide.md` (`.agents/skills/dsh-create-upgrade-guide/SKILL.md`, gated by `verify-upgrade-guides`).

## How to extend (recipes)

1. **New package** — follow `docs/cookbook/adding-a-package.md`: `packages/<group>/<name>/`, `@deepseek-ai/dsh-<name>`, register in exactly one tsconfig aggregate (`tsconfig.host.json` or `tsconfig.client.json`), add the group README row, write the package README with `Summary`/`Model Experience` sections, then `pnpm run constraints` + `pnpm run verify-package-meta`.
2. **New model-facing tool** — `docs/cookbook/adding-a-tool.md`: plugin registers on `ctx.tools` through `ctx.effect()`, tool `name`/`description`/schema live in `src/`, generated catalog comes from `pnpm run gen-tool-catalog`; add a Web presenter+card if it renders (`docs/cookbook/adding-a-tool.md` UI section), a keyless snapshot, and a session event for anything model-visible.
3. **New subagent backend** — implement the provider contract and register on `ctx.subagents` (pattern: `subagent/src/descriptor.ts` + a `subagent-*/src/index.ts` that calls the registration API); document continuability, cancellation, and cleanup; add the provider row to `packages/subagent/README.md`.
4. **New human command** — register `{ definitionId, name, input, handler }` on `ctx.commands` (`packages/interaction/commands/src/index.ts`); keep it out of model history; test the settled UI result. `/plan`, `/goal`, `/feedback` are the templates.
5. **New skill** — add `.agents/skills/<name>/SKILL.md` with YAML `name` + `description` (the trigger sentence), optional `references/` or `templates/`; `pnpm run verify-skill-invocation-metadata` and `doc-sync` validate it. Docs skills must also follow `docs/AGENTS.md`.
6. **New decision record / breaking change** — `.agents/notes/implemented/<class>/<date>-<topic>.md` (+ `.zh.md` + `.i18n.yaml`), and for a broken external surface an upgrade guide; both are gated (`verify-agent-note-format`, `verify-translation-pairing`, `verify-upgrade-guides`).

## Where to look first

1. `AGENTS.md` — standing orders: commands, conventions, PR discipline (187 lines, the single densest file).
2. `docs/development.md` — setup, TypeScript project layout, build/check matrix, CI organization, hooks.
3. `docs/testing.md` — tiers, coverage gate, snapshot rules, real-API policy, subprocess launch modes.
4. `scripts/run-gates.ts` — authoritative gate inventory per aggregate.
5. `CONTRIBUTING.md` + `README.md#L45` — the contribution/bug-report policy.
6. `.agents/skills/dsh-pre-push-checks/SKILL.md` — which checks to run for a given diff.
7. `.agents/skills/dsh-pr-description/SKILL.md` — PR description + AI Usage declaration rules.
8. `.agents/notes/README.md` — Agent Note lifecycle, classes, format gates.
9. `packages/subagent/README.md`, `packages/workflow/README.md`, `packages/jobs/README.md` — orchestration seams and their package maps.
10. `docs/subsystems/{goal,plan,todo,schedule,jobs,workflow,subagent,commands}.md` — per-subsystem reference.

## Constraints & gotchas

- **No external PRs.** The single most important process fact: `CONTRIBUTING.md` declines external pull requests; Discussions is the intake channel for bugs. Any plan that assumes "open a PR from a fork" is currently wrong.
- **Registrations are effects, model-visible ⟺ logged.** Every contribution goes through `ctx.effect()` / `ctx.on()`; anything reaching a model request must be reconstructable from the session log, which usually means a new session event.
- **Per-file 100% coverage** on `packages/*/*/src` is the CI gate (`test:coverage`, not `test`); an uncovered line is treated as dead code to delete rather than a test to bolt on.
- **Snapshot obligation.** Non-trivial model-, protocol-, or human-visible changes update a keyless recorded-session scenario in the same change; SDK projections (`snapshots/sdk/` TS and Python-runtime output) both move when loop/session events change.
- **Source vs artifact plane.** Static gates and tests resolve workspace imports to `src` via `tsconfig.base.json` paths; `build:check` reads existing `build:artifacts` output and never rebuilds — run `build:artifacts` first or `build`.
- **No hardcoded tunables**, no new `as unknown`, no top-level `await`, no bare dispatchers, one physical line per paragraph, exactly one trailing newline, no tracked non-vendor filename containing `golden`, `vendor/*/src` changes must stage the vendor manifest update.
- **Docs are gated hard**: doc budgets (`scripts/doc-budgets.manifest.json`), bilingual pairing (`*.zh.md` + `.i18n.yaml`), generated catalogs must be regenerated not hand-edited, compiled `ts` fences, and `verify-repository-references` link rules.
- **Archived Agent Notes are frozen** — never edit them, never cite them as current authority.
- **Performance budgets are source constants**, not env-overridable; CI owns exhaustive coverage and the platform matrix — do not default to the full suite locally.
- **Telemetry is opt-in by default and off in CI.** Every workflow exports `DSH_TELEMETRY_DISABLED=1`; the base bundle's OTel session upload defaults to `FEEDBACK_ONLY`, and `DISABLED` prevents capture. Feedback and ratings are log-only and never model input.
- **Experimental isolation is gated**: nonexperimental packages need product use or an explicit classification (`scripts/product-package-policy.ts`), and `verify-default-product-isolation` keeps experimental capabilities out of default products — a new capability starts experimental as an optional bundle.
- **Expected-output placement is checked**: output driven by a recorded session goes to top-level `snapshots/` (highest generation per role, `snapshot.yml` pin), everything else stays beside its owner in `tests/expected/` and is not named `*.snapshot.ts`; fixtures replay on macOS and Linux, so fix fixtures rather than normalizers.
- Builds embed version + commit + dirty marker; `pnpm run build:official` omits the dirty marker for release-equivalent artifacts.

## Open questions

1. Is the `deepseek-harness/deepseek-harness` repository intended to become public, and would that lift the external-PR ban? `CONTRIBUTING.md` says "at the moment" but no dated plan is recorded.
2. Which change to the policy would let an outside contributor submit code — Discussion → maintainer-opened Issue → PR, or a future fork workflow? No documented panel exists.
3. Security disclosures have no documented channel (`SAFETY.md` only disclaims readiness); does the team want `SECURITY.md`?
4. `.github/ISSUE_TEMPLATE/*` exists but external Issue creation rights are repository settings — verified only that `blank_issues_enabled: false`, so the intended external path is Discussions. Needs maintainer confirmation.
5. Whether `check:ci:*` local parity is expected from outside contributors at all: `AGENTS.md` says CI owns exhaustive coverage, yet `check:all` reproduces the matrix locally; the recommended minimum set for a first contribution is not stated.
