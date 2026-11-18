# DeepSeek Harness — Working Context Map

Local orientation for this checkout. Generated 2026-11-03 from `master` @ `ce7073d` (root version `0.2.2-alpha.2`).
Detailed evidence lives in the six area maps beside this file; this page is the index and the mental model.

## 1. What this project is

DeepSeek Harness (`dsh`) is DeepSeek AI's open-source agent harness: an "everything is a plugin" runtime built on
[Cordis](https://github.com/cordiverse/cordis) (vendored under `vendor/`). It ships a CLI launcher (`dsh`), a Web GUI,
an Electron desktop app, headless/SDK/ACP automation modes, and ~380 npm packages under `@deepseek-ai/dsh-*`.

- License: MIT. Repo: `deepseek-ai/deepseek-harness`, default branch **`master`** (not `main`).
- Public posture: developer preview, APIs pre-stable, explicit breaking-change warning (`README.md`, `SAFETY.md`).
- Size: ~20,233 tracked files, 52 package groups, pnpm workspace with 396 projects.

## 2. The one mental model

A running `dsh` is a **plugin tree composed at boot from ordered YAML patch layers**, over an empty root:

1. empty `<profile>/cordis.yml` (`[]`)
2. bundle patches from `dsh.profile.bundles`, in order (`dsh-base` first for all shipped profiles except `sdk-minimal`)
3. profile `cordis.patch.yml`
4. `$DSH_HOME/cordis.patch.yml` (machine-level; outranks the profile)
5. `--patch` overlays in argv order
6. launcher telemetry switch

Patches **replace a row's whole `config`** (never deep-merge) and address rows by `id`. The bundle, not the CLI,
decides whether the tree ends in a Web server, headless runner, SDK JSON-RPC server, or ACP bridge.

A **capability seam** is the unit of swappability: Service Definition (abstract Cordis `Service` + `ctx.<key>`) →
Service Provider(s) → Consumer (usually a model-facing tool). `packages/shell` is the canonical example.
Single-backend seams (`ctx.fs`, `ctx.shell`, `ctx.subprocess`, `ctx.sandbox`) throw if a second provider mounts;
named-registry seams (`ctx.llm`, `ctx.web`, `ctx.lsp`) select by provider id.

**Registrations are effects** (`ctx.effect()` / `ctx.on()`), and **model-visible ⟺ logged**: anything that reaches a
model request must be reconstructable from the append-only session log.

## 3. Request lifecycle (the core loop)

```
turn/start → claim input → agent/pre-step (rewrite/reject) → step/start
  → agent/request (deprecated) → ctx.llm.prepareCall → commit system+user messages
  → request/header|context → freeze request → llm/stream
  → assistant/message | assistant/attempt (durable settlement)
  → tool/call → tools/pre-execute → tools/execute → tool body → tools/post-execute → tool/result
  → step/end → (tool continuation | next-step input) → agent/turn-stopping → turn/end
```

- `agent/*` = live coordination events; `session/event` = durable replay/transcript source.
- Everything under `packages/core` is the spine; plugins must depend on `dsh-agent`, never `dsh-agent-loop`.
- The model history is derived (`deriveMessages()`), never stored separately.

## 4. Repository map

| Area | Where | Detailed map |
|---|---|---|
| Agent / session log / tools / prompt | `packages/core/*`, `docs/architecture.md`, `docs/agent-lifecycle.md` | `01-core-agent.md` |
| Launcher, profiles, bundles, SDK/ACP | `apps/cli`, `packages/boot/*`, `packages/bundle/*` | `02-boot-cli.md` |
| Web GUI, desktop, client plugins, host API | `apps/web`, `apps/desktop*`, `packages/client/*`, `packages/host/*`, `packages/api/*` | `03-web-desktop.md` |
| Session persistence, projections, storage, compaction | `packages/session*`, `packages/storage`, `packages/spill`, `packages/attachment` | `04-session-data.md` |
| Model providers, execution world, Typert RPC, MCP/LSP | `packages/llm`, `packages/fs|shell|sandbox|terminal|ssh`, `packages/typert`, `packages/mcp` | `05-capabilities.md` |
| Goals, plan, subagents, jobs, workflow, contributor process, CI | `packages/goal|plan|subagent|jobs|workflow`, `.agents/`, `.github/`, `scripts/` | `06-process-orchestration.md` |

Other high-value roots: `docs/` (architecture, subsystems, cookbook, user guides, upgrade guides), `vendor/` (Cordis
source + sync manifest), `python/` (SDK + runtime wheel), `native/` (Landlock launcher), `snapshots/` (recorded
session replay), `benchmarks/` (perf gates), `website/` (VitePress projection of `docs/`).

## 5. Build & run (this machine)

Toolchain is workspace-local (repo requires Node ≥ 24.9; system Node is 22):

```sh
source .tools/env.sh           # Node 24.22.2 + pnpm 11.28.5 + local caches + DSH_HOME

pnpm run build                 # tsc lib/types + tsdown host/client + web dist
pnpm dsh web --no-open         # run the Web GUI from source-built artifacts
pnpm run test                  # unit tests (per-file 100% coverage is the CI gate: test:coverage)
pnpm run typecheck             # host+client aggregates; setup is "complete" when this passes
pnpm run doc-sync              # documentation gates
```

`.tools/` and `default-workspace/` are excluded via `.git/info/exclude`; they never appear in `git status`.

## 6. Contribution reality (important)

`CONTRIBUTING.md` currently says: **"we cannot accept external pull requests at the moment."**
Issues are disabled on the repo (`has_issues: false`); bug reports go to **GitHub Discussions**
(`https://github.com/deepseek-ai/deepseek-harness/discussions`). Explicitly welcomed alternatives:
publish plugins tagged `dsh-plugin`, write guides/blog posts, answer community questions.

Practical path for this workspace:
1. Use the harness hard; capture reproducible bugs (version `0.2.2-alpha.2` @ `ce7073d`, exact commands, logs).
2. Report with repro + impact in Discussions; upvoting existing threads is the triage signal.
3. Prepare fixes locally on a branch (`git switch -c fix/...`); keep the diff minimal and repo-convention compliant.
4. If/when external PRs open, a fork (`aturzone/deepseek-harness`) + `upstream` remote is ready in minutes.
5. Meanwhile plugins are an accepted contribution surface — the repo is a showcase, not a mandate.

## 7. Daily sync

`./.tools/dsh-sync.sh` — fetches `origin`, reports drift, fast-forwards `master` (never merges/rebases your work).
A session reminder is scheduled daily at 09:00 Asia/Tehran to run the sync and summarize what changed upstream.

## 8. Non-obvious gotchas

- Repo default branch is `master`; CI covers Node 24.9 + latest 24 + 26.
- `pnpm` must be 11.28.5 (pinned); pnpm 12's version manager tries to write outside the sandbox here.
- `pnpm run build:check` only type-checks against existing artifacts; it does not rebuild them.
- Source runs (`pnpm dsh ...`) use tsx ESM and resolve workspace imports to `src`; production runs need built artifacts.
- `--dump-config` initializes missing profile files as a side effect.
- Deprecated: `agent/request` (use `agent.model.select()` + `AgentOptions.maxTokens`), `eventAt`/`snapshotEvents`.
- Session format is v4; committed generations are immutable, migrations are a build-static adjacent chain (no downgrade).
- Per-file 100% coverage: an uncovered line is treated as dead code to delete, not a test to bolt on.
- Archived Agent Notes under `.agents/notes/archived/` are frozen history, never authority.
