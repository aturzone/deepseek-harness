# Capabilities, providers, infrastructure

## One-line purpose

Everything the agent can *do* — call models, touch files, spawn processes, open PTYs, reach remote hosts, search the web, drive browsers, call MCP/LSP servers, run model-written programs — is a swappable capability seam (`ctx.<capability>`) with one abstract Service Definition, one or more Service Provider packages, and Consumer packages (usually model-facing tools) that never import a provider.

## Package inventory

| path | package name | role | key src files |
|---|---|---|---|
| `packages/llm/llm` | `@deepseek-ai/dsh-llm` | Seam Definition: `ctx.llm` + `LlmAdapter` | `src/index.ts` (`LlmRuntime`, `LlmAdapter`, `registerAdapter`), `src/types.ts` (wire vocabulary), `src/assembler.ts`, `src/assistant-stream.ts` |
| `packages/llm/llm-deepseek` | `@deepseek-ai/dsh-llm-deepseek` | Provider library: DeepSeek Messages transport (no route itself) | `src/host.ts` (`registerDeepSeekProvider`), `src/adapter.ts`, `src/messages-api.ts`, `src/files-api.ts`, `src/listing.ts` |
| `packages/llm/llm-deepseek-api-key` | `@deepseek-ai/dsh-llm-deepseek-api-key` | Provider plugin: route `deepseek-official` (API key + listing) | `src/index.ts`, `src/config.ts` |
| `packages/llm/llm-deepseek-account` | `@deepseek-ai/dsh-llm-deepseek-account` | Provider plugin: route `deepseek-account` (OAuth grant) | `src/index.ts` |
| `packages/llm/llm-pi-ai` | `@deepseek-ai/dsh-llm-pi-ai` | Provider adapter: multi-provider routes via pi-ai catalogs | `src/provider-data.generated.ts`, `src/provider.ts`, `src/adapter.ts`, `src/catalog.ts`, `src/auth.ts`, `src/discovery.ts` |
| `packages/llm/llm-retry` | `@deepseek-ai/dsh-llm-retry` | Consumer: retry executor on `agent/request-error` | `src/index.ts`, `src/types.ts` |
| `packages/llm/token-meter` | `@deepseek-ai/dsh-token-meter` | Core: replay token measurement (`ctx.tokenMeter`) | `src/index.ts`, `src/projection.ts` |
| `packages/llm/deepseek-llm-api-extensions` | `@deepseek-ai/dsh-deepseek-llm-api-extensions` | Seam: request-extension contributions | `src/index.ts`, `src/types.ts` |
| `packages/test-support/llm-replay` | `@deepseek-ai/dsh-llm-replay` | Test provider: replay recorded streams keylessly | `src/index.ts` |
| `packages/api/gateway` | `@deepseek-ai/dsh-api-gateway` | Host `ctx.typertGateway` + Client `ctx.remote` faces | `src/index.ts`, `src/client/`, `src/stream-server.ts`, `src/stream-protocol.ts` |
| `packages/api/remotes` | `@deepseek-ai/dsh-api-remotes` | BFF assembly: mounts generated `/remote` contributions + forwarded events | `src/index.ts`, `src/client/`, `src/remote-events.ts` |
| `packages/api/session-controller` | `@deepseek-ai/dsh-api-session-controller` | Host controller: Session/Agent lifecycle, `agent`/`session` lookups | `src/index.ts` |
| `packages/api/workspace-controller`, `terminal-controller`, `settings-controller`, `job-controller`, `account-controller`, `workspace-files` | `@deepseek-ai/dsh-api-*` | One generated Remote namespace each | `src/index.ts` per package |
| `packages/api/remote-access` | `@deepseek-ai/dsh-api-remote-access` | Core: per-Peer method/event authorization (`ctx.remoteAccess`) | `src/index.ts` |
| `packages/typert/protocol` | `@deepseek-ai/dsh-typert-protocol` | Declarations: `@Remote`, `@RemoteScope`, codecs, provider types | `src/index.ts`, `src/types.ts`, `src/remote-error.ts` |
| `packages/typert/registry` | `@deepseek-ai/dsh-typert-registry` | Runtime type registry `ctx.typert` (schemas, descriptors, lookups) | `src/index.ts`, `src/service.ts` |
| `packages/typert/loader` | `@deepseek-ai/dsh-typert-loader` | Loader plugin: auto-registers mounted packages' generated artifacts | `src/index.ts` |
| `packages/typert/generator` | `@deepseek-ai/dsh-typert-generator` | Build-time analyzer/emitter (Host + Host-for-Client artifacts) | `src/analyzer.ts`, `src/emitter.ts`, `src/renderer.ts`, `src/workspace.ts` |
| `packages/fs/fs` | `@deepseek-ai/dsh-fs` | Seam Definition: `ctx.fs` (`FileSystem`) | `src/index.ts` |
| `packages/fs/fs-local`, `fs-sandbox`, `ssh/fs-ssh` | `@deepseek-ai/dsh-fs-*` | Providers (sandbox = local + mode fence) | `src/index.ts` each |
| `packages/fs/fs-patch`, `fs-observation-policy`, `tool-fs`, `tool-fs-search`, `tool-str-replace-editor` | `@deepseek-ai/dsh-*` | Pure patch parser; read-before-edit policy; model tools (`read`/`write`/`edit`/`apply_patch`/`read_image`), `glob`/`grep` | `tool-fs/src/{read,write,edit,apply-patch,read-image}.ts` |
| `packages/subprocess/subprocess` | `@deepseek-ai/dsh-subprocess` | Seam Definition: `ctx.subprocess` (`SubprocessRuntime`) | `src/index.ts` |
| `packages/subprocess/subprocess-local` | `@deepseek-ai/dsh-subprocess-local` | Host provider (OS ranges, node-pty terminals) | `src/index.ts` |
| `packages/sandbox/sandbox` | `@deepseek-ai/dsh-sandbox` | Seam Definition: `ctx.sandbox` (`SandboxProvider.confine`) | `src/index.ts`, `src/diagnostics.ts`, `src/escalation.ts`, `src/roots.ts` |
| `packages/sandbox/sandbox-local` | `@deepseek-ai/dsh-sandbox-local` | Provider: platform runner chain | `src/index.ts`, `src/profiles.ts` |
| `packages/sandbox/sandbox-policy` | `@deepseek-ai/dsh-sandbox-policy` | Core: deployment default mode + workspace root (`ctx.sandboxPolicy`) | `src/index.ts` |
| `packages/shell/shell` | `@deepseek-ai/dsh-shell` | Seam Definition: `ctx.shell` (`ShellExecutor.resolve/execute`) | `src/index.ts` |
| `packages/shell/bash-local`, `bash-sandbox`, `pwsh-local`, `pwsh-sandbox`, `shell-env` | `@deepseek-ai/dsh-*` | Executor providers + `DSH_*` environment registry | `src/index.ts` each |
| `packages/shell/tool-bash`, `tool-pwsh`, `tool-bash-persistent`, `tool-pwsh-persistent` | `@deepseek-ai/dsh-tool-*` | Consumers: model `bash`/`pwsh` tools | `tool-bash/src/index.ts` |
| `packages/terminal/terminal` | `@deepseek-ai/dsh-terminal` | Seam Definition: `ctx.terminals` (`TerminalSessionService`) | `src/index.ts` |
| `packages/terminal/terminal-bash` | `@deepseek-ai/dsh-terminal-bash` | PTY backend (`shell` type, bash/pwsh dialects) | `src/index.ts` |
| `packages/experimental/tool-terminal` | `@deepseek-ai/dsh-tool-terminal` | Consumer: six `terminal_*` tools | `src/index.ts` |
| `packages/ssh/ssh` | `@deepseek-ai/dsh-ssh` | Core: one OpenSSH connection (`ctx.ssh`) | `src/index.ts` |
| `packages/ssh/{fs-ssh,subprocess-ssh,sandbox-ssh,ssh-helper-runtime}` | `@deepseek-ai/dsh-ssh-*` | Paired remote providers + remote helper | `src/index.ts` each |
| `packages/lsp/lsp`, `lsp-stdio`, `tool-lsp` | `@deepseek-ai/dsh-lsp*` | Seam / provider / consumer (four navigation ops) | `lsp/src/index.ts`, `lsp-stdio/src/index.ts`, `tool-lsp/src/index.ts` |
| `packages/web/web`, `tool-web`, `web-search-*`, `web-fetch-http`, `web-deepseek-api` | `@deepseek-ai/dsh-web*` | Seam `ctx.web` / consumer `web_search`,`web_fetch` / providers | `web/src/index.ts`, `tool-web/src/{search,fetch}.ts` |
| `packages/mcp/mcp-client`, `mcp-resources` | `@deepseek-ai/dsh-mcp-*` | MCP tool bridge + `ctx.mcpResources` seam | `mcp-client/src/{connection,transport,tools,server-context}.ts` |
| `packages/computer-use/computer-use`, `browser-use/browser-use` | `@deepseek-ai/dsh-computer-use`, `-browser-use` | Registries: exactly one provider per instance | `src/index.ts` each |
| `packages/ptc-runtime/ptc-runtime`, `ptc-runtime-node` | `@deepseek-ai/dsh-ptc-runtime*` | Seam `ctx.ptcRuntime` / Node backend | `ptc-runtime/src/index.ts`, `ptc-runtime-node/src/{index,execution,launch}.ts` |
| `packages/core/tool-executor-ptc` | `@deepseek-ai/dsh-tool-executor-ptc` | Consumer: `run_code` + generated SDK | `src/index.ts`, `src/ptc.ts` |
| `python/sdk`, `python/sdk-runtime` | `deepseek-harness-sdk`, `deepseek-harness-runtime-bin` | Python SDK over JSON-RPC stdio; bundled CLI carrier | `python/sdk/src/deepseek_harness/{client,api,models,office}.py` |
| `native/system` | `@deepseek-ai/node-addon-system` | Landlock launcher + POSIX `flock` | `native/system/packages/entry`, `docs/{cli-contract,flock-contract}.md` |
| `benchmarks/` | `@deepseek-ai/dsh-benchmarks` | Private perf gates, one dir per measured user path | `benchmarks/*/*.bench.ts`, `benchmarks/support/scaling-report.ts` |

## The capability-seam pattern in practice

A seam is three roles, never one ([docs/capability-seams.md](../../docs/capability-seams.md), [docs/architecture.md `## Capability seams`](../../docs/architecture.md)):

1. **Service Definition** — an abstract Cordis `Service` subclass in the seam package, registered under a `ctx.<key>` and declared by module augmentation (`declare module '@deepseek-ai/cordis' { interface Context { fs: FileSystem } }`). Definitions carry the semantics, not the mechanics: `FileSystem.watch` documents the ready/close protocol, `SandboxProvider.confine` documents fail-closed.
2. **Service Provider** — subclasses the Definition and is loaded as a plugin; Cordis enforces one implementation per context (`SandboxProvider`, `SubprocessRuntime`, `ShellExecutor` all say "loading a second throws"). Providers are selected by composition, not by callers.
3. **Consumer** — a model-facing tool package (or another capability) that injects the ctx key. `tool-bash` uses `ctx.shell`; `bash-local` uses `ctx.subprocess`; `bash-sandbox` uses `ctx.subprocess` + `ctx.sandbox`; `terminal-bash` uses `ctx.subprocess` + `ctx.sandbox` + `ctx.sandboxPolicy`; `lsp-stdio` uses `ctx.subprocess` + `ctx.fs`.

Seam verification in source: each Definition package's `src/index.ts` has the `declare module` block plus an abstract class; `grep -rl "declare module '@deepseek-ai/cordis'" packages/*/*/src/index.ts` enumerates them. `docs/capability-seams.md` is generated (`scripts/gen-doc-graphs.ts`) and classifies each key as `core` (one owner, no provider swap) or `seam`, with a completeness guard that fails when a service is declared without its roles.

Two seam shapes recur: **single backend** (`ctx.fs`, `ctx.shell`, `ctx.subprocess`, `ctx.sandbox`, `ctx.ptcRuntime`, `ctx.workflowEngine` — mounting a second provider throws) and **named-provider registry** (`ctx.llm.registerAdapter(providers, adapter)`, `ctx.web` provider map, `ctx.lsp` provider selection by file extension, `ctx.browserUse`/`ctx.computerUse` one-name-per-instance). Retry-capable registrations return a handle (`AdapterRegistrationHandle.replace(providers)`).

## Model layer (`ctx.llm` + adapters)

- Definition: `packages/llm/llm/src/index.ts` — `LlmRuntime` (service) + `LlmAdapter` (abstract provider). `LlmRuntime` surface: `stream(GenerateOptions)`, `prepareCall(config, signal?, configure?)` (adapter-level default is `prepareCall(provider, model, signal)` → `PreparedAdapterCall`), `listProviders()`, `listModels(provider)`, `resolveModelInfo(...)`, `registerAdapter(providers, adapter)`, `registerConfigurableProviders(entries)`, `registerModelDiscovery(...)`, `providerRetryPolicy(provider)`, `imageRequestPricing`/`imageRequestTarget`, `fileRequestText`. The only abstract adapter method is `stream()`, so an adapter must own one route's full translation.
- Vocabulary lives in `packages/llm/llm/src/types.ts`: content blocks (`text`, `reasoning`, `image`, `file`, `tool-call`, `tool-addition`, `tool-removal`), `StreamChunk`, `TokenUsage`, `LlmConfigurableProvider`, `LlmResolvedModelInfo` (`systemPromptUpdate: 'in-history'`, `toolUpdate`), `LlmRequestPurposeMap` (module-augmented, non-conversation callers declare a purpose).
- One stream = **one provider attempt**. Retry is a separate executor: `packages/llm/llm-retry/src/index.ts` listens on the loop's `agent/request-error` waterfall and re-runs the failed step; direct `ctx.llm.stream()` callers stay single-attempt.
- DeepSeek adapter split: `llm-deepseek` is the shared transport library (`src/host.ts#registerDeepSeekProvider` builds `DeepSeekAdapter`, wraps Messages/Files transport, image offload, replay metadata, request extensions); the *routes* are registered by thin auth plugins: `llm-deepseek-api-key` → `deepseek-official`, `llm-deepseek-account` → `deepseek-account`. Neither falls back to the other.
- pi-ai adapter: `packages/llm/llm-pi-ai/src/provider-data.generated.ts` is generated from the installed `@earendil-works/pi-ai` catalog (`pnpm gen-provider-data`) and maps provider id → ambient env vars + `defaultBaseURL`; `src/index.ts` registers configurable providers, model discovery and the adapter per configured route. Both adapters can be mounted together (route names do not collide); a duplicate route fails with `DUPLICATE_ADAPTER`.
- Credentials are resolved per operation through the `ctx.credentials` seam (`MISSING_CREDENTIAL` if a reference resolves to nothing); `ctx.attachments` resolves durable image refs for adapters; `ctx.deepseekLlmApiExtensions` lets plugins add top-level request fields (`session-log-deepseek`, `plugin-package-inventory-deepseek`).
- Request extensions, model listing caches, and replay metadata all live on the provider side; the loop only sees the neutral vocabulary. `@deepseek-ai/dsh-llm-replay` substitutes a recorded script for keyless snapshot tests.

## Execution world (fs/subprocess/sandbox/shell/terminal/ssh)

- **fs** — `packages/fs/fs/src/index.ts` `FileSystem` (abstract): `resolve`, `processPath`, `fileUrl`, `contains`, `stat`, `lstat`, `readText`, `streamText`, `readBytes`, `readByteRange`, `listDir`, `watch`, `writeText`, `editText`, `patchText`, `deleteFile`, `moveFile`. Errors use `FsError` + `FS_ERROR_CODES`. Providers: `fs-local` (host FS, unconfined), `fs-sandbox` (extends local; fences mutations by `ctx.sandboxPolicy` mode, returns `FS_SANDBOX_DENIED`), `fs-ssh` (remote helper FS). `fs-observation-policy` is not a provider: it listens to the `fs/*` waterfall intent events (`fs/write-intent`, `fs/edit-intent`, `fs/delete-intent`, `fs/observed`) to enforce read-before-write.
- **subprocess** — `packages/subprocess/subprocess/src/index.ts` `SubprocessRuntime`: `resolveExecutable`, `terminalEnvironment`, `spawn(spec)`, `spawnTerminal(spec)`. No shell interpretation, scrubbed env, OS-owned managed range, kill escalation, bounded output with spill. Provider: `subprocess-local`; remote provider: `subprocess-ssh`. Consumers: `bash-local`, `bash-sandbox`, `terminal-bash`, `lsp-stdio`, `tool-fs-search` (ripgrep), `subagent-*` out-of-process backends.
- **sandbox** — `packages/sandbox/sandbox/src/index.ts` `SandboxProvider.confine(argv, policy, signal): Promise<ConfinedArgv>`; returns the argv to spawn plus `full`/`partial` enforcement; silent unconfined passthrough is forbidden (`SANDBOX_UNAVAILABLE`). Modes: `read-only` / `workspace-write` / `danger-full-access`. Provider: `sandbox-local` — Linux chain `bwrap` → `landlock` (via `@deepseek-ai/node-addon-system/landlock-run`), macOS `seatbelt` (`sandbox-exec`), Windows `windows-acl`; profiles built in `src/profiles.ts`, denial signatures per runner in `src/index.ts`. `ctx.sandboxPolicy` is the single home for the deployment default mode + workspace root; both `bash-sandbox` and `fs-sandbox` read it so they never confine to different roots.
- **shell** — `packages/shell/shell/src/index.ts` `ShellExecutor`: `resolve(request): ShellExecSpec` (explicit defaulting step) then `execute(spec): Promise<ShellExecution>`; foreground vs background is what the caller awaits. Providers: `bash-local` (fresh non-login `bash -c`), `bash-sandbox` (wraps through `ctx.sandbox`), `pwsh-local`, `pwsh-sandbox`. `ctx.shellEnv` supplies the trusted `DSH_*` namespace. Consumers: `tool-bash`, `tool-pwsh`, hooks bridges.
- **terminal** — `packages/terminal/terminal/src/index.ts` `TerminalSessionService`: `registerBackend(backend)` / `listBackends()`, `spawn(owner, request, signal)`, `startSend(owner, id, request)`, `read`, `signal`, `kill`, `list`, `hasOwnerActivity`; every method takes the owning `Agent` and fails with `FOREIGN_SESSION`/`NO_SESSION` on mismatch. Sessions are process-local and cleaned up on owner/plugin disposal. Backend: `terminal-bash` (`shell` type, `shellDialect: bash|pwsh`, sandboxed through `ctx.sandbox`). Consumer: `packages/experimental/tool-terminal` (`terminal_open|send|read|signal|close|list`).
- **ssh** — `packages/ssh/ssh/src/index.ts` `SshConnection` (one authenticated OpenSSH alias, digest-verified helper, non-reconnecting). It is a *core* service, not a seam: the three paired providers (`fs-ssh`, `subprocess-ssh`, `sandbox-ssh`) all consume `ctx.ssh`, and the helper runtime (`ssh-helper-runtime`) must be installed on the remote host. Swapping the whole execution world to SSH makes Bash, PTY, LSP, and Ns move together with no provider forks.
- Cross-cutting rules: the model-visible `bash`/`pwsh` tools own presentation and sandbox escalation hints; `ctx.approval` decides one-shot permission; `ctx.jobs` registers background work.

## Remote gateway + Typert RPC

Layering is `remotes → gateway → connection → webserver` ([docs/api-gateway.md](../../docs/api-gateway.md)).

- **Authoring**: business services extend `TypertRemoteService` (or declare `readonly typertRemote = bindTypertRemote(this, key)`) and mark public instance methods `@Remote` (or `@RemoteScope(key)` for scoped receivers) from `packages/typert/protocol/src/index.ts`. `@Remote({ mode: 'stream' })` for `Iterable`/`AsyncIterable`/`RemoteStream<Out, In>`; a final `signal: AbortSignal` parameter is descriptor metadata for cancellation.
- **Generation** (`scripts/generate-typert.ts` → `packages/typert/generator`): strictly analyzes the Host `ts.Program`, then emits four files into each contributing package's `lib/`: `typert.host.js/.d.ts` (Host reflection + strict descriptors + schemas) and `typert.remote-client.js/.d.ts`/`.d.ts.map` (mountable contribution + Client declaration merges). Business packages expose `./typert` (Host) and `./remote` (Host-for-Client). No generator run = no Client types.
- **Host runtime**: `packages/api/gateway/src/index.ts` provides `ctx.typertGateway`; `typert-registry` holds descriptors/schemas (`ctx.typert`) and lookup/Context providers; `typert-loader` auto-registers every mounted package's artifacts. `invoke()` resolves descriptor + live service per call (no caching), validates exact `args`, resolves lookup identities (`agent`, `session` by the Session Controller) or scoped Contexts, checks `ctx.remoteAccess.decide()` for non-owner Peers, then invokes.
- **Client runtime**: `packages/api/gateway/src/client` provides `ctx.remote`; `$mount()` installs concrete `remote.<namespace>` child Services from generated contributions (no Proxy). Unary calls go through `ctx.connection.rpc.call('/api', '<ns>/<method>', { args })` → `POST /api/<ns>/<method>`; streams use the multiplexed `/api/remote.mux` WebSocket with per-stream uplink frames and half-close.
- **Assembly**: `packages/api/remotes` (Host entry selects forwarded events; Client entry mounts the chosen `/remote` contributions and re-exports their declaration merges type-only). Adding a Host Remote namespace to a client is an explicit assembly decision.
- **SRC fallback**: `node --import tsx/esm` (no compiler plugin) still dispatches by parsing parameter names from the live function; weaker validation, no Client codecs — development only.
- Controller packages own business policy, not transport: `api-session-controller` owns Session/Agent identity and lookups; `workspace-controller` + `directoryPickerController`; `terminal-controller`; `settings-controller`; `job-controller`; `account-controller`; `workspace-files` (read-only, stat/paged text/byte windows/listing/change feed).

## MCP, LSP, web, computer/browser use, PTC

- **MCP**: `packages/mcp/mcp-client` connects one server per config entry (`transport: stdio | streamable-http`, `serverName`, reconnect/backoff, `toolCallTimeoutMs`, `maxInstructionBytes`) and registers the server's tools on `ctx.tools` under `mcp__<serverName>__<rawName>` with agent-scoped visibility; server instructions join the logged system prompt. `packages/mcp/mcp-resources` is a seam (`ctx.mcpResources`, Definition + provider both in that package) serving `list_mcp_resources`, `list_mcp_resource_templates`, `read_mcp_resource`. No server is enabled by default; startup failure degrades to "no tools" unless `failOnStartupError`.
- **LSP**: `packages/lsp/lsp` is the `ctx.lsp` seam — exactly four read-only operations (definition, references, implementations, hover), provider selection by file extension, structured `LspError` codes, no JSON-RPC escape hatch. Provider `lsp-stdio` spawns configured servers through `ctx.subprocess` per workspace, reads files through `ctx.fs`, serializes queries per server. Consumer `tool-lsp` exposes the `lsp` tool with one-based UTF-16 coordinates.
- **Web**: `packages/web/web` is `ctx.web` (`search()` / `fetch()`, per-call provider resolution, one error vocabulary, no network of its own). Providers: `web-search-exa`, `web-search-perplexity`, `web-search-deepseek`, `web-fetch-http`, `web-deepseek-api`. Consumer `tool-web` owns the stable model-facing `web_search` / `web_fetch` names and labels results as untrusted external data.
- **computer-use / browser-use**: `packages/computer-use/computer-use` (`ctx.computerUse`) and `packages/browser-use/browser-use` (`ctx.browserUse`) are one-slot registries — one provider per service instance, duplicate load fails with the registered name. Providers live in `packages/experimental/computer-use-*` and `packages/experimental/browser-use-*` (Playwright MCP, Chrome DevTools MCP, Stagehand native, CUA driver MCP/native) and each owns its own tools and sessions; the registry adds no tools and no cross-session coordination.
- **PTC**: `packages/ptc-runtime/ptc-runtime` is `ctx.ptcRuntime` — `resolve(request)` → `run(spec)` with program format (`async-function-body` vs REPL/script), lossless JSON result / captured logs / structured error, `retainsState` per owner. Backends: `ptc-runtime-node` (default `per-call` processes, `vm-script`, opt-in `persistent-in-memory`, sandbox policy applied, heap/time/output limits), experimental Python runtime. Consumers: `tool-executor-ptc` (`run_code`, bridges tool calls, emits `tool/ptc-dispatch*` pairs) and `workflow-ptc`.

## Python SDK + native addon

- `python/sdk` (`deepseek-harness-sdk`, module `deepseek_harness`): high-level turns API + low-level JSON-RPC client in `client.py`/`api.py`/`models.py`; drives a `dsh` subprocess over newline-delimited JSON-RPC on stdio; never reads `~/.dsh` implicitly (a Harness home must be selected). `office.py` exposes local Office conversion/recalculate/render without an agent or API key.
- `python/sdk-runtime` (`deepseek-harness-runtime-bin`): the bundled `dsh` CLI plus native sidecars for the current platform (`runtime-bootstrap.mjs`, `_resources.py`); the SDK pins the same-version runtime wheel.
- `native/system` (`@deepseek-ai/node-addon-system`): Landlock launcher (`landlock-run` → `launcherPath`, `probe`, `grantArgs`) and POSIX `flock` (`tryLockExclusive(fd)`), with prebuilt platform packages (`linux-x64/arm64`, `darwin-x64/arm64`) as optional dependencies. Consumers: `sandbox-local` (Landlock rung) and session/storage locking. Never compiles native code at consumer install time.
- `benchmarks/`: private workspace, one directory per measured user path (`agent-continuation`, `session-open`, `session-corpus`, `long-session-browser`, `terminal-io`, `active-stream-reconnect`, `conversation-fold`, `user-text`), workers built into `benchmarks/.dsh-build/`, budgets recorded through `benchmarks/support/scaling-report.ts`, run by `pnpm run test:bench`.

## How to extend

1. **Add a model provider** — write an `LlmAdapter` subclass and call `ctx.llm.registerAdapter([route], adapter)` from a plugin that injects `llm`; optionally `registerConfigurableProviders()` + `registerModelDiscovery()` so settings/UI can activate it. Copy `packages/llm/llm-pi-ai/src/index.ts` (dynamic routes) or `packages/llm/llm-deepseek/src/host.ts` (one route + transport library).
2. **Add a model-facing capability** — register a tool on `ctx.tools` with a schema, add its system-prompt section through `ctx.systemPrompt`, and keep the durable `tool/call`/`tool/result` events; the loop needs no change (`packages/core/tools`, cookbook `docs/cookbook/adding-a-tool.md`).
3. **Swap the execution world** — mount alternative providers for `ctx.fs` + `ctx.subprocess` + `ctx.sandbox` (+ `ctx.shell` when a dialect changes). `packages/ssh/*` is the worked example: one new connection service plus three provider packages; no tool changes.
4. **Add a shell/terminal backend** — subclass `ShellExecutor` (`resolve` + `execute`) or call `ctx.terminals.registerBackend()`; then reuse `tool-bash`/`tool-terminal` unchanged. If the backend must confine, wrap argv through `ctx.sandbox.confine()` and resolve the policy via `ctx.sandboxPolicy`.
5. **Expose a Host service to the GUI** — extend `TypertRemoteService`, mark methods `@Remote`/`@RemoteScope`, then run the ordered lib build so the generator writes `typert.host.*` before the Client compiles `typert.remote-client.*`; add the namespace to `packages/api/remotes`. Changing only a method body needs no regeneration.
6. **Add a web/search/fetch or LSP provider** — register into `ctx.web` / `ctx.lsp` with a provider id; the model-facing `web_search`/`web_fetch`/`lsp` schemas stay identical, which is the point of the seam.

## Where to look first

- `packages/llm/llm/src/index.ts` — the whole model seam in one file: `LlmAdapter`, `LlmRuntime`, registration handles.
- `packages/llm/llm/src/types.ts` — the neutral wire vocabulary every adapter and the session log share.
- `packages/sandbox/sandbox/src/index.ts` + `packages/sandbox/sandbox-local/src/index.ts` — the cleanest small seam: one abstract `confine()`, one multi-platform provider chain.
- `packages/fs/fs/src/index.ts` — the largest Definition; read the `watch()` contract and the `fs/*` waterfall events before touching `tool-fs`.
- `packages/shell/shell/src/index.ts` — the request/spec split that AGENTS.md calls the template for explicit defaulting.
- `docs/api-gateway.md` + `packages/api/gateway/README.md` — Typert RPC end to end, including generation order and the SRC fallback.
- `packages/bundle/base/cordis.patch.yml` — the shipped composition: which providers/tools are actually mounted and with what defaults.
- `docs/capability-seams.md` — generated table of every `ctx.*` key with owner, implementations, and direct consumers.
- `docs/tool-catalog.md` — generated catalog of every tool package, tool name, injected services, and emitted events.
- `packages/typert/generator/src/analyzer.ts` — what the strict Remote analysis accepts and rejects.

## Constraints & gotchas

- **One provider per single-backend seam.** Mounting a second `ctx.shell`/`ctx.subprocess`/`ctx.sandbox`/`ctx.fs` throws at load; `ctx.browserUse`/`ctx.computerUse` enforce one *named* provider per instance instead.
- **Fail closed.** `SandboxProvider.confine` must return enforcing argv or fail; a partial-enforcement runner is reported as `partial`, and a requested mode that cannot be enforced fails with `SANDBOX_UNAVAILABLE` rather than running unconfined. The sandbox is same-world confinement (host kernel/filesystem), not an isolation boundary.
- **Two roots must match.** `fs-sandbox` and `bash-sandbox` both read `ctx.sandboxPolicy`; do not derive a workspace root locally or writes and commands will confine to different trees.
- **Remote methods are strict.** Public, non-static, non-generic instance methods only; no destructuring/defaults/rest/optional parameters; complex objects need a `TypertLookupMap` + runtime provider. Missing either half fails the build or the first call.
- **Generated artifacts are build outputs.** Edit source, rerun the ordered lib build (`pnpm run build:lib`), never hand-edit `lib/typert.*`. `dev:web` rebuilds Client bundles but does not regenerate Remote DTS.
- **DeepSeek route split.** `deepseek-official` reads only the API-key reference; `deepseek-account` only the stored grant. Signing out does not remove API keys and vice versa.
- **Streams are one attempt.** Retry only exists through `dsh-llm-retry` on the loop's `agent/request-error`; a direct `ctx.llm.stream()` consumer must handle every failure itself.
- **PTY and terminal sessions are process-local** and owner-fenced; they vanish on harness restart. Long-lived state belongs in files or another service.
- **MCP servers add tools at runtime.** A crashed/slow server delays startup or fails calls; tool names are stable (`mcp__server__tool`) but discovery failure preserves the previous tool set silently.
- **Do not write to the repo from this mapping task**; the only written file is `.context-map/05-capabilities.md`.

## Open questions (max 5)

1. Are `ctx.sandbox` backends ever mixed per execution world (e.g. local fs + SSH subprocess), or does the design always require the paired SSH providers for all three? (Source suggests pairing is mandatory; not verified end to end.)
2. `@deepseek-ai/dsh-computer-use` and `dsh-browser-use` live in non-experimental groups while every provider is experimental — is that a product-support commitment or a pending classification?
3. Which generated Client namespace each controller owns: confirmed for `session`/`skills`/`fileReferences`, `workspace`/`directoryPicker`, `settings`/`credentials`, `job`; `account` and `terminal` namespaces were not read in source (unverified).
4. Python SDK feature parity on capabilities: only Office helpers and the minimal profile are documented here; whether the SDK exposes MCP/LSP/provider registration to Python callers is unverified.
5. `benchmarks/` budgets are enforced by `test:bench` gates; which directories are release-blocking versus advisory is defined in per-directory READMEs, not read here.
