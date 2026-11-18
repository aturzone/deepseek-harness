# Core: agent / session / tools

## One-line purpose

`packages/core` is the agent spine every composition boots: an append-only event-sourced Session log (`ctx.sessions`), ordered system-prompt + tool-schema assembly (`ctx.systemPrompt`), a scoped tool registry with a guarded execution pipeline (`ctx.tools`), the public `Agent` handle and live registry (`ctx.agents`), the default `agent-loop` driver that turns queued input into turns/steps/model calls/tool calls/durable events (`ctx.agentLoop`), the per-agent scoping primitive (`dsh-scope`), and two thin support packages (deployment default model, deprecated tool-presentation selector).

## Package inventory

| Path | Package | Role | Key src files |
|---|---|---|---|
| `packages/core/scope` | `@deepseek-ai/dsh-scope` | Dependency-free scoped-registration + scope-filtered event routing primitive. Library, **no ctx key**. | `src/index.ts` (`createScope`, `scopeOf`, `scopeTarget`, `bindScopeParent`, `scopeChainOf`), `src/store.ts` (`ScopedLayers`, `NamedEntries`, `AnonymousEntries`, `ScopeLayer`) |
| `packages/core/session` | `@deepseek-ai/dsh-session` | Append-only `SessionEvent` log, in-memory `SessionStore`, derived model history, fork, flush, crash repair. | `src/index.ts` (`Session` :525, `SessionStore` :1064), `src/types.ts` (`SessionEventMap`, header, `TurnEndReasonMap`), `src/surface.ts`, `src/request-header.ts`, `src/repair.ts`, `src/fork.ts`, `src/tool-history.ts` |
| `packages/core/system-prompt` | `@deepseek-ai/dsh-system-prompt` | Ordered prompt sections, dynamic runtime context, prompt variables, tool-schema providers; `assemble()` + `renderPrompt()`. | `src/index.ts` (`SystemPrompt` :436, `renderPrompt` :297, `renderContextSections` :337) |
| `packages/core/tools` | `@deepseek-ai/dsh-tools` | Scoped tool registry, `defineTool` schema DSL, restrictions, monotonic guards, executor selection, shared invocation pipeline. | `src/index.ts` (`ToolsService` :99), `src/contracts.ts`, `src/schema.ts` (`defineTool` :555), `src/pipeline.ts`, `src/batch.ts`, `src/events.ts`, `src/executor.ts`, `src/presentation.ts`, `src/json-schema.ts` |
| `packages/core/tool-executor-native` | `@deepseek-ai/dsh-tool-executor-native` | Default `ToolExecutor`: direct per-tool function calls, bounded parallel-safe groups, ordered results. Registers via `ctx.tools.setExecutor`. | `src/index.ts` (`NativeToolExecutor`) |
| `packages/core/tool-executor-ptc` | `@deepseek-ai/dsh-tool-executor-ptc` | `ToolExecutor` exposing only `run_code` plus a generated TypeScript/Python SDK; owns nested dispatch and PTC logging. | `src/index.ts` (`PtcExecutor`), `src/ptc.ts`, `src/ts-types.ts`, `src/py-types.ts`, `src/runtime-types.ts` (`tools/ptc-dispatch-log`), `src/config.ts`, `src/client.ts` |
| `packages/core/agent` | `@deepseek-ai/dsh-agent` | Public `Agent` handle, `AgentRegistry`/factory slot, process-local initiator scope, `agent/*` event vocabulary, `Model`/`Inbox` contracts, durable projections. | `src/index.ts` (`AgentRegistry` :252), `src/runtime-types.ts` (`Agent` augmentation :189, events), `src/types.ts` (base `Agent`, inbox/model types, merged session events), `src/dispatch.ts` (fused dispatcher), `src/model-selection.ts`, `src/projection.ts`, `src/consumed-work.ts`, `src/archive-admission.ts` |
| `packages/core/agent-loop` | `@deepseek-ai/dsh-agent-loop` | Default `AgentFactory`/driver: creates and resumes agents, owns the turn/step machine, streaming, tool dispatch, persistence integration. | `src/index.ts` (`AgentLoop` class, `static inject` :292, `Config`), `src/agent.ts` (`ReactLoopAgent`; `kick` :268, `preStep` :283, `turn` :327, `step` :435), `src/inbox.ts` (`ReactLoopInbox` + `inbox` projection), `src/assistant-stream.ts`, `src/runtime-context.ts`, `src/constants.ts` |
| `packages/core/agent-default-model` | `@deepseek-ai/dsh-agent-default-model` | Deployment default `ModelSelection` for fresh agents; `currentSelection()` / `saveSelection()`. | `src/index.ts` |
| `packages/core/agent-tool-presentation` | `@deepseek-ai/dsh-agent-tool-presentation` | **Deprecated** preset-scope `native`/`ptc` selector; wires `ctx.tools.setExecutor` for the mounting scope. | `src/index.ts` |

Adjacent services the core depends on (not in `packages/core`): `ctx.sessionProjections` (`packages/session/session-projection`), `ctx.llm` (`packages/llm/llm`), `ctx.workingDirectory` (`packages/session/working-directory`). Group map: `packages/core/README.md`.

## Services & events

### ctx keys (declaration sites verified in source)

| Key | Service | Declared in |
|---|---|---|
| `ctx.sessions` | `SessionStore` | `packages/core/session/src/index.ts:39` |
| `ctx.systemPrompt` | `SystemPrompt` | `packages/core/system-prompt/src/index.ts:14` |
| `ctx.tools` | `ToolsService` | `packages/core/tools/src/index.ts:33` |
| `ctx.agents` | `AgentRegistry` | `packages/core/agent/src/index.ts:31` |
| `ctx.agentLoop` | `AgentLoop` (also owns loop `Config`) | `packages/core/agent-loop/src/index.ts:177` |
| `ctx.agentDefaultModel` | `AgentDefaultModelConfig` | `packages/core/agent-default-model/src/index.ts:17` |

Injected/optional: `AgentRegistry` requires `sessionProjections` (`agent/src/index.ts:253`); `AgentLoop` injects `['agents','sessions','llm','tools','systemPrompt','sessionProjections']` (`agent-loop/src/index.ts:292`); `ToolsService` injects `systemPrompt` (`tools/src/index.ts:100`). `dsh-scope`, both executors, and the presentation selector expose no ctx key.

### Dispatch modes (semantics per `docs/cordis-primer.md#dispatch-modes`)

`emit` = fire-and-forget, listener failures contained, cannot veto; `serial` = awaited in order, first bail value wins; `waterfall` = around-middleware chain, every listener must call `next()`; `parallel` = all awaited, results collected. Agent-subject events dispatch through the fused `agentEvents` dispatcher (`agent/src/dispatch.ts`), so the payload's `agent` and the scope carrier cannot diverge; scope-filtered events only reach listeners tagged with that agent or an ancestor.

### The `Agent` surface (`agent/src/types.ts:16`, augmented at `agent/src/runtime-types.ts:189`)

`id`, `options` (`AgentOptions`: provider/model/reasoningEffort/maxTokens), `session`, `model` (`current()`/`select()`), `inbox` (`nextTurn`/`nextStep` + `append`/`prepend`/`replace`/`remove`/`clear`/`splice`), `status` (`'idle'|'running'`), `ctx` (agent-scoped Context), `cancel(cause, {keepInbox?})`, `whenIdle()`, `runMaintenance(task)`, `send(message, target, wakeup)`, `followup()`, `steer()`, `inject()`.

### Agent events — live coordination (`packages/core/agent/src/runtime-types.ts`)

Producer is `agent-loop` through the fused dispatcher `agentEvents(ctx, agent, carrier)` (`agent/src/dispatch.ts:107`), which injects the `agent` subject and dispatches with the `scopeTarget(agent, agent)` carrier; `agent/created`/`agent/disposed` are dispatched by the registry (`agent/src/index.ts`).

| Event | Mode | Line | Notes / main consumers |
|---|---|---|---|
| `agent/created` | serial | 290 | awaited creation listeners; must not await `whenIdle()` or owner disposal |
| `agent/disposed` | emit | 299 | registry detach; teardown/coordinator listeners |
| `agent/status` | emit | 309 | `'idle' \| 'running'`; UI, goal driver, compaction |
| `agent/inbox/inserted` | emit | 317 | per-message; UI/inbox projections |
| `agent/inbox/claimed` | emit | 328 | per-message `{message, turn}` |
| `agent/inbox/discarded` | emit | 336 | per-message durable cancellation |
| `agent/pre-step` | waterfall | 350 | authoritative `PreStepDecision` (`reject` \| `enter`), carries claimed messages, turn/step, signal, `modelSelection` |
| `agent/request` | waterfall | 373 | **deprecated**; adjusts call controls only, must keep provider/model/effort |
| `agent/request-error` | waterfall | 389 | return `{kind:'retry'}` without `next()` to own recovery |
| `agent/assistant-stream` | emit | 399 | transient start/chunk/end frames; replay reads durable settlement |
| `agent/turn-stopping` | serial | 417 | terminal checkpoint; steering keeps the turn open |
| `agent/error` | emit | 429 | step/turn failure notification |
| `agent-loop/config-start-failed` | emit | `agent-loop/src/index.ts:199` | declarative agent failed before publication |

### Session events — durable facts (`packages/core/session/src/index.ts`)

| Event | Mode | Line | Notes |
|---|---|---|---|
| `session/created` | emit (synchronous veto) | 56 | creation listeners read-only; a sync throw rolls creation back |
| `session/disposed` | emit | 65 | once per announced session leaving the store |
| `session/event` | emit | 76 | post-commit fire-and-forget feed; observer failures contained |
| `session/flush` | parallel | 84 | awaited durability checkpoint |

`SessionEventMap` (`session/src/types.ts`) core members: `turn/start`, `turn/end`, `step/start`, `step/end`, `user/message`, `developer/message`, `system/message`, `assistant/message`, `assistant/attempt`, `tool/call`, `tool/result`, `request/header`, `request/context`, `session/end-seed`. `packages/core/agent/src/types.ts:103` merges two more: `agent/inbox/spliced` (normalized pending-list mutation, folded before `append()` returns) and `model/selection` (log-only). Other packages merge `compaction/*`, `hook/*`, `fs/*`, `todo/write`, `tool/ptc-dispatch`, etc. Main consumers of the `session/*` notifications: `dsh-agent-loop`, `dsh-session-persistence-jsonl`, `dsh-session-projection(-cache)`, `dsh-session-telemetry`, `dsh-session-title`, `dsh-headless`, `dsh-acp`, `session-controller`.

### Tool events (`packages/core/tools/src/events.ts`)

| Event | Mode | Line |
|---|---|---|
| `tools/pre-execute` | waterfall | 18 |
| `tools/execute` | waterfall | 29 |
| `tools/post-execute` | waterfall | 41 |
| `tools/result` | emit | 49 |
| `tools/change` | emit (unfiltered) | 56 |
| `tools/ptc-dispatch-log` | waterfall | `tool-executor-ptc/src/runtime-types.ts:46` |

Key listeners (from `docs/event-producer-consumer.md`): `tools/pre-execute` — hooks bridges, `tool-jobs`, `workspace-changes`; `tools/execute` — `timeout-policy`, `session-checkpoint-policy`; `tools/post-execute` — `spill-policy`, `repeat-tool-reminder`, fs search; `tools/result` — `subagent`, `tool-present`, `ui-trajectory`.

### System-prompt events (`packages/core/system-prompt/src/index.ts`)

`system-prompt/assemble` (waterfall, :31) — scope-filtered presentation over sections/contexts/variables; `system-prompt/change` (emit, :37) — unfiltered registry notification.

### Projections registered on `ctx.sessionProjections`

`turnBoundary` (`agent/src/projection.ts:21`, read via `ctx.agents.turnBoundaryOf(session)` at `agent/src/index.ts:306`), `modelSelection` (`agent/src/model-selection.ts:72`), `inbox` (`agent-loop/src/inbox.ts:26`). The registry itself lives in `packages/session/session-projection`.

### Adjacent session-owned service: working directory (`docs/subsystems/working-directory.md`)

`ctx.workingDirectory` (`packages/session/working-directory`) owns each Session's effective directory: `get(session)` reads the logged value without I/O, `ensure(agent)` validates it and restores the original project when the directory disappeared, `set(agent, path)` records a change as `working-directory/change`. Initial and current values reach the model as required user-context snapshots — never as system-prompt text — and changes are local to one Session: sandbox writable roots and project membership stay anchored to the original project, while relative FS operations, new processes, instruction discovery, skills, and completion use the active directory. `working_directory` (packages/session/tool-working-directory) exposes one optional `cd` argument.

## Turn/step lifecycle & data flow

Canonical diagrams: `docs/agent-lifecycle.md`, `docs/architecture.md#turn-flow`, `docs/tool-execution-pipeline.md`. Source of truth: `packages/core/agent-loop/src/agent.ts`.

1. **Delivery.** `Agent.followup/steer/inject/send` (interface augmented at `agent/src/runtime-types.ts:189`; base at `agent/src/types.ts:16`) write identified `UserMessage`s into `next-turn`/`next-step`; every mutation commits one `agent/inbox/spliced` and emits the matching per-message notification. `kick()` (`agent.ts:268`) loops `turn()`.
2. **Turn open.** `session.append('turn/start')` (`agent.ts:336`); the driver claims all `next-step` input plus one `next-turn` prompt via `ReactLoopInbox.claim` (pure deletion splices, then `agent/inbox/claimed`).
3. **Step proposal.** `preStep()` (`agent.ts:283`): snapshot `agent.model.current()` (fails without provider+model), `ctx.tools.resolve({agent, modelSelection, signal})`, `ctx.systemPrompt.assemble({...assembleContextFor(agent, signal), modelSelection, toolSet})`, then the `agent/pre-step` waterfall. Default `enter` projects runtime context (`runtime-context.ts`) onto the batch. `reject` — or a first `enter` rewritten empty — closes the turn (`{kind:'blocked'|'completed'}`) with no step.
4. **Step open + admission.** `step/start`; `prepareRequest()` (`agent.ts:613`) runs the deprecated `agent/request` waterfall then `ctx.llm.prepareCall(config, signal)`; a changed provider/model/effort throws. The rendered prompt is reconciled into `system/message` surface nodes via `SystemPromptProjection.project(renderedPrompt, {inHistory, startsSeries})` (`agent.ts:453`); the entered `user/message` batch is appended once (first attempt only); `systemPrompt.refreshContext()` restores runtime facts; `request/header` (`initial|resume|change|series`) and `request/context` are logged as needed; `buildRequest()` (`agent.ts:656`) derives and freezes the request.
5. **Stream.** `preparedCall.stream(request)` else `ctx.llm.stream`; live `agent/assistant-stream` frames; settlement commits exactly one durable `assistant/message` (assembled message + compact timed stream + optional usage; `interrupted: true` for cancelled mid-stream text) or log-only `assistant/attempt`. `agent/request-error` may return `{kind:'retry'}`; retries reuse the rendered assembly without repeating assembly/pre-step/user admission.
6. **Tools.** Tool-call blocks go as one raw batch to `ctx.tools.execute({calls, signal, agent, log:{turn,step}, maxParallelToolCalls, toolSet})` (`agent.ts:590`). The selected executor logs `tool/call` before execution; per call the shared pipeline runs `tools/pre-execute` → monotonic `ctx.tools.guard()` → approval for `ask` → `tools/execute` (around dispatch) → tool body → `projectContent` → `tools/post-execute` → `finalizeContent` → `tools/result` → one `tool/result`. `additionalContexts` are spliced into the `next-step` inbox after recorded results.
7. **Close.** `step/end` then `toolSet.dispose()`; a tool continuation or fresh next-step input claims another step; otherwise `agent/turn-stopping` (serial, `agent.ts:396`) runs and `turn/end` records the `TurnEndReason` (`agent.ts:422`). Failed steps first append recovery results (`TOOL_NOT_STARTED`, `TOOL_OUTCOME_UNKNOWN`) for unanswered calls.
8. **Status/cancellation.** `agent/status` mirrors `running` (whole drain interval, possibly multiple queued turns) vs `idle`. `cancel()` aborts the active activity and, unless `keepInbox`, durably discards pending input; `turn/end` records `{kind:'aborted', reason: AgentCancelCause}`.

## How to extend

1. **Register a tool.** `ctx.tools.register(defineTool({name, description, parameters, output, execute}), { when? })` — `packages/core/tools/src/index.ts:128`; `defineTool` at `tools/src/schema.ts:555`. The schema joins prompt assembly automatically. Per-agent variant: `agent.ctx.tools.register(...)`.
2. **Gate or wrap tool calls.** `ctx.on('tools/pre-execute'|'tools/execute'|'tools/post-execute'|'tools/result', ...)` (`tools/src/events.ts`); owner policy that must never be reordered: `ctx.tools.guard(fn)` (`tools/src/index.ts:384`); per-agent narrowing: `ctx.tools.restrict({allow, deny})` (`tools/src/index.ts:162`).
3. **Add prompt material.** `ctx.systemPrompt.section({name, order, text})` (:485), `ctx.systemPrompt.getSectionOrder(name)` for centrally allocated named orders (:501), `.context({...})` for durable user-role snapshots (:520), `.variable(name, provider)` (:568), `.tools(provider)` for schema providers (:552), `.suppressRuntimeContext()` (:537). Per-agent shadowing via `agent.ctx.systemPrompt`.
4. **Intercept the loop.** `agent/pre-step` to rewrite/reject the claimed batch, `agent/request-error` to retry, `agent/turn-stopping` to steer or close, `agent/inbox/*` to project queue state. Register through `agent.ctx` for one agent, or globally with `{ global: true }` where supported. `agent/request` is deprecated — use `agent.model.select()` + `AgentOptions.maxTokens`.
5. **Swap a seam.** Custom driver: implement `AgentFactory` and `ctx.agents.setFactory(factory)` (`agent/src/index.ts:383`). Custom executor: `ctx.tools.setExecutor(executor)` (`tools/src/index.ts:325`; nearest scope wins, one per scope). Extra model providers belong on `ctx.llm`, not here.
6. **Add a session event.** `declare module '@deepseek-ai/dsh-session/types' { interface SessionEventMap { 'my/event': {...} } }`; if it produces model-visible content, also register a pure definition with `ctx.sessions.registerMessageProjection()` (`session/src/index.ts:1081`) and tag the event `@messageProjection`. Plugin records (`appendPluginRecord`) are restricted to `packages/experimental/`.

## Where to look first

1. `packages/core/agent-loop/src/agent.ts` — the turn/step machine (`preStep`, `turn`, `step`, `prepareRequest`, `buildRequest`).
2. `docs/architecture.md#turn-flow` + `docs/agent-lifecycle.md` — canonical ordered lifecycle.
3. `packages/core/agent/src/runtime-types.ts` — every `agent/*` payload and mode.
4. `packages/core/session/src/index.ts` — `Session.append`, `deriveMessages`, `fork`, `SessionStore` lifecycle.
5. `packages/core/session/src/surface.ts` — surface fold, replacement validation, `deriveEventMessage`.
6. `packages/core/tools/src/pipeline.ts` — `prepare`/`dispatch`/`complete`, cancellation and result normalization.
7. `packages/core/tools/src/contracts.ts` — `ToolDefinition`, `PreToolDecision`/`PostToolDecision`, guards, error codes.
8. `packages/core/system-prompt/src/index.ts` — `assemble`, `refreshContext`, `renderPrompt`, `toolOrder`.
9. `packages/core/agent/src/index.ts` — `create`/`resume`/`get`/`roots`/`isOwnedBy`, `withInitiator`.
10. `docs/event-producer-consumer.md` — generated producer/listener matrix per event.

## Constraints & gotchas

- **`agent/*` is live coordination; `session/event` is the replay/transcript source.** Model-visible ⟺ logged: any new model-visible input needs a session event. `agent/assistant-stream` chunks are transient.
- **Waterfall listeners MUST call `next()`** to delegate; returning without it short-circuits the chain. `agent/pre-step`'s returned decision is authoritative; wrapping listeners preserve `messages` and `startsRequestSeries` unless replacing intentionally. `agent/turn-stopping` is serial and has no `next()`.
- **`agent/request` is deprecated** (`runtime-types.ts:373`): retained for existing listeners; it cannot change provider/model/effort or messages.
- **Creation listeners share the initialization lifetime.** An `agent/created` listener must not await `agent.whenIdle()` or its own owner's disposal.
- **Session append rules.** Writes require store membership + completed synchronous `session/created`. Non-lossless JSON is rejected. Surface events require `surfaceOp`; a replacement is exactly `{op:'replace', startSeq, endSeq}` with inclusive seqs in current surface order. `header.system` and canonical-empty optional header fields (`tools: []`, `adapterDefaults: {}`) are rejected. `eventAt`/`snapshotEvents`/`ownEvents` are deprecated: existing logic and repository tests may remain, but new production calls must use `seq` (or a projection).
- **The system prompt is a surface node, not header state.** `system/message` node 0 is the prompt; an empty rendering clears all active system nodes through logged per-node replacements; `systemPromptUpdate: 'in-history'` routes append instead of rewriting the head.
- **Inbox identity.** `MessageId` must be unique across both pending lists; every mutation logs one `agent/inbox/spliced`; ordinary removal/`clear()` are durable cancellations (`outcome:'canceled'`), claiming is pure deletion. `cancel()` clears the inbox by default; there is no step-only abort.
- **Tool policy limits.** `tools/pre-execute` deliberately cannot rewrite `exec.arguments`; only `tools/execute` may replace `exec.signal` (the registry re-fuses caller cancellation); `timeoutMs` on a definition is declarative and enforced only by `@deepseek-ai/dsh-tool-call-timeout-policy`; concurrency classification is unary (parallel-safe or exclusive barrier) from the definition, not an event.
- **One executor per scope**, nearest scope selects it; a withdrawn PTC selection never falls back to native; PTC exposes only `run_code` directly.
- **Initiator scope is process-local attribution**, never liveness proof or authorization; cross-worker/process/persistence boundaries need explicit identity.
- **Root shutdown persistence:** shutting down the root context with an active Agent can leave the final `turn/end` in memory but absent from the persisted log.
- **Plugins depend on `@deepseek-ai/dsh-agent`, never `@deepseek-ai/dsh-agent-loop`.** Changing the loop requires updating `docs/architecture.md`; `SESSION_FORMAT_VERSION` bumps follow `docs/session-format-status.md` and reader-compatibility review.
- **`dsh-scope` only isolates scope-aware APIs** (registries must file by `scopeOf()`, events dispatch through `scopeTarget()`); a Context carries one nearest scope key.

## Open questions

1. `agent/request` is declared at `packages/core/agent/src/runtime-types.ts:373`, yet the generated `docs/event-producer-consumer.md` lists it under “Non-harness or undeclared event strings.” Whether `scripts/gen-doc-graphs.ts` intentionally filters deprecated declarations is **unverified**.
2. Which production listeners still register `agent/request` beyond `dsh-compaction-basic` — not audited; the migration path is `docs/upgrade-guide/v0.2.1-alpha.4/session-model-selection/guide.md`.
3. PTC nested-call concurrency: the README says subcalls “reuse the native concurrency contract,” but `tool-executor-ptc/src/ptc.ts` was not read line-by-line, so `maxParallelSubCalls` vs batch `maxParallelToolCalls` precedence is **unverified**.
4. `Session.firstLiveSeq` / `firstLifecycleSeq` (`session/src/index.ts:566`, `:573`) semantics relative to `session/end-seed` were not read; fork/seed consumers treat them as boundaries (**unverified**).
5. `dsh-agent-tool-presentation` is deprecated with no sunset version or removal condition stated in its README (**unverified**).
