# Web + Desktop + Client UI

## One-line purpose

The browser GUI is a Cordis application: a Node **host half** (`packages/host/*`, `packages/api/*`) serves an authenticated HTTP/WebSocket API and the built SPA, while a **browser half** (`packages/client/*`) boots a lazy-CJS module table of independently built plugin bundles, activates them as Cordis fibers, and composes React through typed slots. `apps/web` is the Vite build of that browser half; `apps/desktop` wraps the same Web app in Electron with `dsh-app://` document serving and Node IPC boot injections.

## Package inventory

**Applications / entry points**

| path | package name | role | key src files |
|---|---|---|---|
| `apps/web` | `@deepseek-ai/dsh-web-frontend` | Vite shell build over `@deepseek-ai/dsh-client-web`; emits `dist/` served by the Host | `src/main.ts`, `src/preview.ts`, `vite.config.ts`, `product-isolation.ts`, `katex-fonts.ts`, `index.html` |
| `apps/desktop` | `@deepseek-ai/dsh-desktop` (private) | Electron carrier: main process, preloads, packaging, updates, bundled runtime | `src/main.ts`, `src/host-process.ts`, `src/ipc.ts`, `src/preload-app.ts`, `src/web-document.ts`, `tsdown.config.ts`, `electron-builder.config.mjs` |
| `apps/desktop-host` | `@deepseek-ai/dsh-desktop-host` (private) | Private Node-mode host process started by Electron; boots the `desktop` profile | `src/index.ts`, `src/cli.ts`, `src/update-tasks.ts`, `src/quit-inspection.ts`, `src/file-drag.ts` |
| `packages/bundle/web-app` | `@deepseek-ai/dsh-web-app` | Web bundle patch layer + runtime glue: dist serving, URL line, `webApp` service | `src/index.ts`, `src/startup.ts`, `cordis.patch.yml`, `presets/*.patch.yml` |
| `apps/cli` (out of scope) | `@deepseek-ai/dsh` | `dsh web` / `dsh --profile web` boots the web profile | `src/bin.ts`, `src/args.ts` |

**Client kernel (browser foundation)**

| path | package name | role | key src files |
|---|---|---|---|
| `packages/client/web` | `@deepseek-ai/dsh-client-web` | Boot kernel: two-stage boot, framework-free boot page, shared module table | `src/boot.ts` (`AppWebEntry`), `src/boot-client.ts`, `src/mount.ts`, `src/platform.ts`, `src/apply-injections.ts`, `src/seed.ts` |
| `packages/client/modules` | `@deepseek-ai/dsh-client-modules` | `dsh.client` scan → `window.__DSH_BOOT__` graph, `/plugins` combo route, lazy-CJS module table | `src/index.ts`, `src/client/manifest.ts`, `src/client/system.ts`, `src/assets.ts` |
| `packages/client/connection` | `@deepseek-ai/dsh-client-connection` | Browser↔Host wire: `/api`, RPC, Fetch routes, generations, trust fence | `src/index.ts`, `src/rpc-host.ts`, `src/http-bridge.ts`, `src/api-path.ts`, `src/browser-auth.ts`, `src/client/` |
| `packages/client/hmr` | `@deepseek-ai/dsh-client-hmr` | Live graph sync and dev bundle reload | `src/` |
| `packages/client/store` | `@deepseek-ai/dsh-client-store` | React-free observable/snapshot-store engine | `src/` (`defineStore`, `createSnapshotStore`) |
| `packages/client/locale` | `@deepseek-ai/dsh-client-locale` | `ctx.locale` preferences + typed dictionaries | `src/` |
| `packages/client/shortcuts` | `@deepseek-ai/dsh-client-shortcuts` | Window-local keyboard command registry + physical dispatch | `src/`, `src/protocol` |
| `packages/client/file-upload` | `@deepseek-ai/dsh-client-file-upload` | Raw Blob/byte-stream request bodies off the page thread | `src/` |
| `packages/client/resources` | `@deepseek-ai/dsh-client-resources` | `dsh-resource://` providers behind the `useResource` root hook | `src/client/resources.ts`, `src/client/contract.ts` |
| `packages/client/product-analytics` | `@deepseek-ai/dsh-client-product-analytics` | Desktop-only product events via OTel | `src/` |

**Render / composition machinery**

| path | package name | role | key src files |
|---|---|---|---|
| `packages/client/ui-slots` | `@deepseek-ai/dsh-client-ui-slots` | Typed slot registry, `SlotMap`, prop type algebra | `src/index.ts`, `src/renderer.ts`, `src/store.ts` |
| `packages/client/ui-renderer` | `@deepseek-ai/dsh-client-ui-renderer` | Sole ctx→React binder; renders `root` | `src/client/app.tsx`, `bindings.tsx`, `bind.ts`, `registry.ts`, `scoped-slots.tsx` |
| `packages/client/ui-session` | `@deepseek-ai/dsh-client-ui-session` | Session scope adapter + standard props | `src/client/index.ts`, `session-provider.tsx` |
| `packages/client/ui-layout` | `@deepseek-ai/dsh-client-ui-layout` | Region layout, theme application, `usePanelInfo` | `src/client/` |
| `packages/client/ui-dockkit` | `@deepseek-ai/dsh-client-ui-dockkit` | Docking layout operations/components | `src/client/` |
| `packages/client/ui-primitives` | `@deepseek-ai/dsh-client-ui-primitives` | Shared controls, icons, markdown/math/highlight renderers | `src/client/` |
| `packages/client/ui-theme` | `@deepseek-ai/dsh-client-ui-theme` | `--dsw-*` tokens, global sheets, fonts, corner-shape | `src/styles/base.css`, `corner-shape.css`, `brand-font.css` |

**Feature plugins (one package = one `src/client/` browser half)**

| path | package name | role | key src files |
|---|---|---|---|
| `packages/client/ui-conversation` | `@deepseek-ai/dsh-client-ui-conversation` | Target-neutral conversation assembly, event/view/group registries, shell, input | `src/client/conversation/assembler.ts`, `contract/conversation.ts`, `contract/slots.ts` |
| `packages/client/ui-chat` | `@deepseek-ai/dsh-client-ui-chat` | Chat target: Definitions, snapshot builder, Chat view | `src/client/conversation-nodes/register.ts`, `chat-snapshot-builder.ts`, `contract/chat-nodes.ts`, `contract/group-tree.ts` |
| `packages/client/ui-trajectory` | `@deepseek-ai/dsh-client-ui-trajectory` | Trajectory target view + its assistant Definition | `src/client/trajectory-assistant-definition.ts`, `layout.ts`, `index.ts` |
| `packages/client/ui-tool` | `@deepseek-ai/dsh-client-ui-tool` | Tool-call trees and keyed per-tool views (`tool.call.toolview`) | `src/client/` |
| `packages/client/ui-settings` | `@deepseek-ai/dsh-client-ui-settings` | Settings domain base: `ctx.configForms`, canonical settings slot contract | `src/client/contract/slots.ts` |
| `packages/client/ui-settings-general` | `@deepseek-ai/dsh-client-ui-settings-general` | Settings shell, nav, General section, onboarding | `src/client/` |
| `packages/client/ui-settings-models` | `@deepseek-ai/dsh-client-ui-settings-models` | Model-provider config + DeepSeek onboarding | `src/client/` |
| `packages/client/ui-settings-account` | `@deepseek-ai/dsh-client-ui-settings-account` | Account section | `src/client/` |
| `packages/client/ui-settings-session-log` | `@deepseek-ai/dsh-client-ui-settings-session-log` | Session-log upload control | `src/client/` |
| `packages/client/ui-settings-plugins` | `@deepseek-ai/dsh-client-ui-settings-plugins` | Built-in plugins section shell + tab extension | `src/client/` |
| `packages/client/ui-settings-shell` | `@deepseek-ai/dsh-client-ui-settings-shell` | Shell settings page on the Plugins page | `src/client/` |
| `packages/client/ui-settings-agent-loop` | `@deepseek-ai/dsh-client-ui-settings-agent-loop` | Agent-loop settings page on the Plugins page | `src/client/` |
| `packages/client/ui-settings-subagent` | `@deepseek-ai/dsh-client-ui-settings-subagent` | Subagent settings page on the Plugins page | `src/client/` |
| `packages/client/ui-settings-web-search` | `@deepseek-ai/dsh-client-ui-settings-web-search` | Web-search provider page; the canonical `configForms.whileServed` + `plugins.item` example | `src/client/index.ts` |
| `packages/client/ui-settings-plugin-inventory` | `@deepseek-ai/dsh-client-ui-settings-plugin-inventory` | Read-only Host Loader inventory tab | `src/client/` |
| `packages/client/ui-plan` | `@deepseek-ai/dsh-client-ui-plan` | Plan-mode status and exit control | `src/client/` |
| `packages/client/ui-jobs` | `@deepseek-ai/dsh-client-ui-jobs` | Session background-job list + streaming record panels | `src/client/` |
| `packages/client/ui-schedule` | `@deepseek-ai/dsh-client-ui-schedule` | Automation page, right-sidebar task tab, header clock | `src/client/` |
| `packages/client/ui-deliverables` | `@deepseek-ai/dsh-client-ui-deliverables` | Changed-files card, delivery cards, produced-file references | `src/client/`, `changes.ts`, `presented.ts` |
| `packages/client/ui-reference` | `@deepseek-ai/dsh-client-ui-reference` | Unified `@file` / `@session` reference source | `src/client/` |
| `packages/client/ui-attachment` | `@deepseek-ai/dsh-client-ui-attachment` | Composer rail, drop overlay, file cards, message images | `src/client/`, `AttachmentRail.tsx`, `FileCard.tsx`, `MessageImage.tsx` |
| `packages/client/ui-sidebar` | `@deepseek-ai/dsh-client-ui-sidebar` | Workspace/session navigation rail | `src/client/` |
| `packages/client/ui-sidebar-right` | `@deepseek-ai/dsh-client-ui-sidebar-right` | Right sidebar + tab types (`ctx.sidebarRight`, `ctx.sidebarRightTabs`) | `src/client/` |
| `packages/client/ui-sidebar-files` | `@deepseek-ai/dsh-client-ui-sidebar-files` | Workspace files page and per-pane trees | `src/client/` |
| `packages/client/ui-sidebar-browser` | `@deepseek-ai/dsh-client-ui-sidebar-browser` | Sandboxed HTTP(S) browser tabs (incl. loopback) | `src/client/` |
| `packages/client/ui-sidebar-documentpreview` | `@deepseek-ai/dsh-client-ui-sidebar-documentpreview` | Document preview tabs (`ctx.documentPreviews`) | `src/client/` |
| `packages/client/ui-sidebar-terminal` | `@deepseek-ai/dsh-client-ui-sidebar-terminal` | Terminal tabs | `src/client/` |
| `packages/client/ui-workspace` | `@deepseek-ai/dsh-client-ui-workspace` | Workspace selection/creation, directory-flow holes | `src/client/` |
| `packages/client/ui-approval` | `@deepseek-ai/dsh-client-ui-approval` | Approval requests → user decisions | `src/client/` |
| `packages/client/ui-user-questions` | `@deepseek-ai/dsh-client-ui-user-questions` | Interactive agent questions | `src/client/` |
| `packages/client/ui-goal` | `@deepseek-ai/dsh-client-ui-goal` | Goal bar and management | `src/client/` |
| `packages/client/ui-workflow-run` | `@deepseek-ai/dsh-client-ui-workflow-run` | Durable workflow runs as nested chat disclosures | `src/client/` |
| `packages/client/ui-subagent` | `@deepseek-ai/dsh-client-ui-subagent` | Subagent navigation, child transcripts | `src/client/` |
| `packages/client/ui-agent-preset` | `@deepseek-ai/dsh-client-ui-agent-preset` | Preset selection and authoring | `src/client/` |
| `packages/client/ui-commands` | `@deepseek-ai/dsh-client-ui-commands` | Session-aware command discovery/dispatch | `src/client/` |
| `packages/client/ui-input-trigger` | `@deepseek-ai/dsh-client-ui-input-trigger` | Inline command/reference suggestion coordination | `src/client/` |
| `packages/client/ui-skill` | `@deepseek-ai/dsh-client-ui-skill` | Skill references in inline suggestions | `src/client/` |
| `packages/client/ui-model-selection` | `@deepseek-ai/dsh-client-ui-model-selection` | Composer model picker | `src/client/` |
| `packages/client/ui-permission-presets` | `@deepseek-ai/dsh-client-ui-permission-presets` | Default permissions + current-session access switch | `src/client/` |
| `packages/client/ui-secret-mask` | `@deepseek-ai/dsh-client-ui-secret-mask` | Masks recognized credentials in sent user text | `src/client/` |
| `packages/client/ui-plugin-manager` | `@deepseek-ai/dsh-client-ui-plugin-manager` | Plugins page/panel: install, enable, disable, retry, compose | `src/client/` |
| `packages/client/ui-plugin-market` | `@deepseek-ai/dsh-client-ui-plugin-market` | Discover tab over market indexes | `src/client/` |
| `packages/client/ui-entry-customization` | `@deepseek-ai/dsh-client-ui-entry-customization` | Region More menus: pin/unpin launchers, start plugin draft | `src/client/` |
| `packages/client/ui-message-feedback` | `@deepseek-ai/dsh-client-ui-message-feedback` | Ratings + feedback dialogs (`ctx.feedbackUi`) | `src/client/` |
| `packages/client/ui-context-menu` | `@deepseek-ai/dsh-client-ui-context-menu` | `useContextMenu` provider + `contextMenu.icon` slot | `src/client/` |
| `packages/client/ui-file-actions` | `@deepseek-ai/dsh-client-ui-file-actions` | File save / clipboard-image actions (Desktop bridge) | `src/client/` |
| `packages/client/ui-file-drag` | `@deepseek-ai/dsh-client-ui-file-drag` | Native file-drag bridge surface | `src/client/` |
| `packages/client/ui-open-in-app` | `@deepseek-ai/dsh-client-ui-open-in-app` | Session-header split button + default-app controls | `src/client/` |
| `packages/client/ui-directory-picker-browse` | `@deepseek-ai/dsh-client-ui-directory-picker-browse` | In-app directory browsing surface | `src/client/` |
| `packages/client/ui-directory-picker-native` | `@deepseek-ai/dsh-client-ui-directory-picker-native` | Native OS chooser surface (Desktop or Host) | `src/client/` |
| `packages/client/ui-brand-official` | `@deepseek-ai/dsh-client-ui-brand-official` | Official name/marks in generic brand slots | `src/client/` |
| `packages/client/ui-shortcuts` | `@deepseek-ai/dsh-client-ui-shortcuts` | Keyboard-shortcut reference | `src/client/` |

**Host packages**

| path | package name | role | key src files |
|---|---|---|---|
| `packages/host/webserver` | `@deepseek-ai/dsh-host-webserver` | `node:http(s)` named routes, upgrades, index injection table, fallback seat | `src/index.ts`, `src/injections.ts` |
| `packages/host/frontend-static` | `@deepseek-ai/dsh-host-frontend-static` | SPA dist server on the fallback seat (auth on index, public assets) | `src/index.ts` |
| `packages/host/directory-picker` | `@deepseek-ai/dsh-host-directory-picker` | Picking seam: `ctx.directoryPicker` contract + errors | `src/index.ts`, `src/types.ts` |
| `packages/host/directory-picker-native` | `@deepseek-ai/dsh-host-directory-picker-native` | Native OS chooser backend (incl. Win32 dialogs) | `src/index.ts`, `native-picker.ts`, `win32-dialog*.ts` |
| `packages/host/directory-picker-browse` | `@deepseek-ai/dsh-host-directory-picker-browse` | In-app browser backend for remote clients | `src/index.ts` |
| `packages/host/directory-picker-auto` | `@deepseek-ai/dsh-host-directory-picker-auto` | Boot-time chooser that mounts native or browse pair | `src/index.ts`, `probe.ts`, `resolve.ts` |
| `packages/host/open-in-app` | `@deepseek-ai/dsh-host-open-in-app` | Catalog/icon/launch routes behind Connection trust | `src/index.ts`, `catalog.ts`, `icons.ts`, `resolver.ts` |
| `packages/host/plugin-inventory` | `@deepseek-ai/dsh-host-plugin-inventory` | Read-only Loader projection: Remote `pluginInventory/list` | `src/index.ts`, `src/types.ts` |
| `packages/host/product-telemetry-otel` | `@deepseek-ai/dsh-host-product-telemetry-otel` | Explicit product events over OTLP/HTTP (`ctx.productTelemetry`) | `src/index.ts` |

**API controllers / transport assembly** (`packages/api/*`): `gateway` (`ctx.typertGateway`, `/api/remote.mux` in `src/stream-protocol.ts`), `remotes` (`ctx.remote` assembly), `remote-access` (decisions), `session-controller`, `workspace-controller`, `workspace-files`, `job-controller`, `settings-controller`, `terminal-controller`, `account-controller` — each a paired Host/Client face.

## Host ↔ browser architecture

**Boot chain.** `dsh web` boots the `web` profile from `packages/bundle/web-app/cordis.patch.yml`; `packages/bundle/web-app/src/index.ts` mounts `@deepseek-ai/dsh-host-frontend-static` with `distIndex` resolved from `@deepseek-ai/dsh-web-frontend/package.json` → `dist/index.html`. On every index render the webserver emits `webserver/index-inject(table, peer)` (`packages/host/webserver/src/index.ts`); `dsh-client-modules` (node half, `bootInjections()` in `packages/client/modules/src/index.ts`) appends exactly four kinds of row: an inline `script` installing the `window.__ModuleLoader__` queue facade, `script-preload` rows for the application batches, `script-src` head rows for the bootstrap batches, and the `global` row `__DSH_BOOT__` carrying the graph. `renderIndexInjections` (`packages/host/webserver/src/injections.ts`) writes them into the HTML, followed by the `__DSH_BOOT_READY__` settling script.

**Page side.** `apps/web/src/main.ts` imports the brand font, constructs `AppWebEntry(#root)` and calls `run()`. `AppWebEntry` (`packages/client/web/src/boot.ts`) awaits `__DSH_BOOT_READY__`, reads `window.__ModuleLoader__`, creates the module system from `__DSH_BOOT__` + `PLATFORM_MODULES` (`packages/client/web/src/platform.ts`), prefetches `immediately` rows, runs `bootClient` (vendored Cordis Loader over `ctx.modules`), installs Electron window-drag recall, and hands the container to `uiRenderer.mount()`. `ui-renderer` performs the sole `ctx.slots.renderSlot('root')`.

**Wire.** Browser `dsh-client-connection` owns `/api` (`src/api-path.ts`), browser authentication cookie, Host/Origin trust fence, unary JSON RPC (with multipart byte attachments), exact Fetch routes, and connection generations. Logical streams ride the Gateway-owned `/api/remote.mux` WebSocket (`packages/api/gateway/src/stream-protocol.ts`); the internal `$events` stream is the generation source. `ctx.remote` comes from `@deepseek-ai/dsh-api-gateway/client` + generated `api-remotes` contributions; `rpcId` is minted by the initiator and echoed by the responder (minting stays in Connection). Client models (`session-controller/client`, `workspace-controller/client`) mirror Host state React-free.

**Slots.** `SlotMap` declaration merges declare key, cardinality (`single`/`list`/`keyed`/`chain`), scope (`root`/`session`/`session-maybe`), owner props and optional slot-level inject. A registration's `children` object is both declaration and authorization: rendering an undeclared slot, or declaring one already owned elsewhere, fails during activation. Components receive only derived shares: `PropsRuntime`, `PropsRenderSlots`, `PropsRenderFactories`, `PropsStore`, the inject face and `PropsLocale`; framework hooks (`useSession`, `useSessions`, `useWorkspaces`, `useResource`, `useConversation`, `useChat`, `usePanelInfo`, …) are bound by `ui-renderer`/domain adapters. Cross-package contributions use `ctx.slots.inject(key, () => ctx.slots.register(...))`.

**Conversation nodes.** `ui-conversation` owns `ctx.uiConversation` registries (`events`, `views`, `groups`) and one `ConversationNodeAssembler` per Session over `SessionEventLikeEntry` windows. A `ConversationNodeDefinition` = `{ kind, target, match, start, update, publication?, buildLocationData?, buildViewNode? }`; `match` sees only the current event and returns `{ id, role, exclusive? }`, State folds deterministically by log `seq`. Targets are `chat` and `trajectory`; each target package registers its own Definitions and builder, and renders through the keyed `conversation.chat.node` slot. Chat ships ~13 Definitions + a builder + group definition in `packages/client/ui-chat/src/client/conversation-nodes/register.ts`; `groupTree` positions (`exchange`/`input`/`turn`/`process`) drive process grouping and Turn folding (`contract/group-tree.ts`).

**Boot globals contract.** `__DSH_BOOT__` (`WebBootGraph`: `rev`, `release?`, `entries[]`, `batches[]`), `__ModuleLoader__` (`load`/`create`), `__DSH_BOOT_READY__` (PromiseWithResolvers), and the optional `__DSH_TRANSPORT__` (`loadBundle`/`resolveAsset`/`streamBaseUrl`/`ownsHost`) that Desktop and the worker preview inject.

## Desktop carrier specifics

- **Electron main** (`apps/desktop/src/main.ts`): registers the privileged `dsh-app:` scheme (standard, secure, `supportFetchAPI`, CORS, stream, code cache), then `protocol.handle` serves `dsh-app://shell/…` from the app bundle (`renderer/`, update dialogs), `dsh-app://app/…` from the packaged `@deepseek-ai/dsh-web-frontend/dist`, and forwards every other `app` path to the authenticated Host (`forwardWebRequest`). `serveWebDocument` injects the `__DSH_BOOT_READY__` deferred into `index.html`.
- **Host process**: `apps/desktop/src/host-process.ts` spawns an Electron Node-mode child (`ELECTRON_RUN_AS_NODE`, `stdio: [..., 'ipc']`) running the built `@deepseek-ai/dsh-desktop-host/lib/index.js` entry (source: `apps/desktop-host/src/index.ts`), which calls `runProfile({ profile: 'desktop', args: ['--no-open', '--host', '127.0.0.1', '--port', '0'] })` and reports over Node IPC: `starting`, `ready` (`{ url, injections }`), `fatal`, `platform-session`, `file-drag-resource`, `update-tasks`, `quit-inspection`, `shutdown-complete`.
- **Boot injections**: main's `ipcMain.handle(DESKTOP_IPC.boot)` returns `{ injections, streamBaseUrl }` after startup; `apps/web/src/main.ts` sees `globalThis.dshDesktopBoot`, calls `ready()`, sets `__DSH_TRANSPORT__ = { ownsHost: true, streamBaseUrl }`, applies injections with `applyIndexInjections`, then resolves `__DSH_BOOT_READY__` — so Desktop never fetches a served index. `failed()` reports native recovery.
- **Preload bridges** (`apps/desktop/src/preload-app.ts`, origin-scoped to `dsh-app://app`): `dshDesktopBoot`, `__DSH_DIRECTORY_PICKER__` (`pick()` → `ipcMain` folder dialog), `__DSH_HOST_PATHS__` (`webUtils.getPathForFile`), `dshPlatform`, `dshDesktop` product API (file actions, browser bridge, file drag, device info, keyboard/shortcuts, updates), `__DSH_LOCALE__`. IPC channel names live in `apps/desktop/src/ipc.ts`.
- **HTTP forwarding**: `web-document.ts` withholds `set-cookie` and connection-level headers, re-marks `/plugins/*` responses `cache-control: no-store`, and rejects foreign `Origin`s.
- **Bundled runtime**: signed `resources/app.asar/dsh` carries the production dependency tree; `resources/runtime/primary-runtime` carries Node/Python/pnpm; the profile is `$DSH_HOME/profiles/desktop` (CLI cannot boot it). Packaging/signing lives in `apps/desktop/electron-builder.config.mjs`, `packaging/`, `windows-signing/`, `publishing/` — out of scope here.
- **Desktop dev**: `pnpm run dev:desktop` runs `apps/desktop/scripts/dev.ts` (build host + client bundles + Web frontend + Electron shell, project into `apps/desktop/.desktop-build/development/project`, launch Electron). Host/renderer/main inspector ports 9229/9222/9230.

## Build artifacts & dev workflow

| artifact | producer | consumer |
|---|---|---|
| `apps/web/dist/` (index.html, `assets/*`, vendor chunk, `assets/fonts/*.woff2`, `preview.html` + `preview/`) | `vite build` in `apps/web` (`pnpm run build:web`) | `dsh-host-frontend-static` fallback seat; packaged `dist` for Desktop |
| `packages/client/*/lib/client.js` (closure factory calling `window.__ModuleLoader__.load`) | `tsdown` with `packages/client/tsdown.client.ts` `clientBundle` | `/plugins/??…/client.js` combo route |
| `packages/client/*/lib/types/**` | `tsc -b tsconfig.client.json` | tsdown lib entries, typecheck |
| `packages/client/*/lib/assets/**` | tsdown asset emit (`src/client/assets/`) | `/plugins/<pkg>/assets/<path>` |
| `packages/*/*/lib/index.js` (Node/host halves) | `tsdown` per package | `dsh` runtime, profile Loader |
| `apps/desktop/lib/main.js` + `lib/preload-*.cjs` + `lib/welcome/` | `apps/desktop/tsdown.config.ts` (after the workspace tsdown pass) | electron-builder packaging |
| `apps/desktop-host/lib/index.js` | tsdown | Electron-spawned Host process |

- Aggregate: `pnpm run build:artifacts` = `build:lib:host` + `build:lib:client` + `build:web`; `build:check` typechecks aggregate tests against built output.
- `pnpm run dev:web` (`scripts/dev-web.ts`): `build:artifacts` once, then three long-lived watchers — `tsc -b tsconfig.client.json --watch` (types), `tsdown` watch (bundles), `vite build --watch` (`apps/web/dist`) — plus `dsh web`. `--poll` for network mounts; must not run beside `pnpm run build`/`build:artifacts` (same output trees). Reloads are triggered by the Host stat-polling bundles (`client-modules` `rebuilt` → `client-hmr`), not by the script.
- `pnpm run start:web` skips the build; `pnpm run dev:desktop` / `start:desktop` mirror this for Electron.
- Test lanes: `pnpm run test:gui` (vitest `packages/client` + `packages/host`), `DSH_SNAPSHOT=replay pnpm run test:web` (build + browser smoke + replayed e2e; `refresh`/`record` to re-baseline), `apps/web/tests/*.e2e.ts` + `stress-tests/`.

## How to extend

1. **New chat node.** Declare the durable event(s) with `SessionEventMap` merging on the producer's type export, then in a client plugin `ctx.uiConversation.events.register({ kind, target: 'chat', match, start, update, publication, buildLocationData?, buildViewNode })` and register the keyed renderer with `ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({ name: 'conversation.chat.node', key }, View))`. Merge `ChatNodeDataMap` (ui-chat) and `ConversationStepDataMap` (ui-conversation) for typed node data, choose a `groupTree` position, and satisfy the eight verification obligations in `docs/subsystems/conversation.md`. Follow `packages/client/ui-chat/src/client/conversation-nodes/assistant.ts` for streaming.
2. **New settings card/page.** Register into `settings.section` (General-style page), `settings.plugins.tab` (Plugins page) or `plugins.item` via `ctx.slots.inject(...)`; bind a locale namespace (`ctx.locale.register`, `locale: NS`), pass an `inject` factory, and read/write Host settings through `ctx.configForms` — gate the page with `ctx.configForms.whileServed([ns], …)`. Model: `packages/client/ui-settings-web-search/src/client/index.ts`.
3. **New UI plugin package.** Skeleton: `package.json` (`@deepseek-ai/dsh-client-<name>`, `dsh.client { platform: 'web', inject?, immediately? }`, `exports["./client"]`), `tsconfig.json` extending `tsconfig.base.client.json`, `tsdown.config.ts` using `clientBundle(import.meta.dirname, ['lib/types/index.js'])`, `src/index.ts` node-half `apply`. Three registration surfaces are all required: `tsconfig.client.json` `references`, a row in `packages/bundle/web-app/cordis.patch.yml`, and a `packages/bundle/web-app/package.json` dependency. Rebuild with `pnpm --filter <pkg> bundle` before probing a live server.
4. **New Host RPC method.** Extend the owning `packages/api/*-controller` Host service (extends `TypertRemoteService`, `@Remote`/`@RemoteScope` decorators, optional `signal: AbortSignal` and `RemoteStream<Out, In>` uplink), regenerate its `typert`/`remote` artifacts, and consume the generated `ctx.remote.<namespace>` face from the Client. Streams must be `@Remote({ mode: 'stream' })`; non-JSON payloads (downloads, uploads) belong on an exact Connection Fetch route instead.
5. **New boot injection row.** Listen to `webserver/index-inject` and push `IndexInjection` rows (`global`/`script`/`script-src`/`script-preload`/`style`/`html`); rows are JSON-serializable because the same table feeds served HTML and the page-side interpreter (`applyIndexInjections`).
6. **New directory-picker backend or chooser policy.** Implement the `ctx.directoryPicker` seam in a Host package and occupy the ui-workspace directory-flow holes with a client surface; register both in `BACKEND_PACKAGES`-style composition (`packages/host/directory-picker-auto/src/index.ts`) rather than branching in consumers.

## Where to look first

1. `apps/web/vite.config.ts` — build shape, vendor chunking, KaTeX/fonts, standalone-serve rejection, `node:module` alias.
2. `apps/web/src/main.ts` — page entry and the Desktop boot-injection branch.
3. `packages/client/web/src/boot.ts` — `AppWebEntry`: two-stage boot and renderer handoff.
4. `packages/client/modules/src/index.ts` + `src/client/manifest.ts` — boot graph wire, `/plugins` route, module table.
5. `packages/host/webserver/src/injections.ts` — `IndexInjection` rows and `__DSH_BOOT_READY__` settling.
6. `packages/bundle/web-app/src/index.ts` — dist serving, URL line, `webApp` service.
7. `packages/client/connection/src/rpc-host.ts` + `packages/api/gateway/src/stream-protocol.ts` — `/api` RPC and `/api/remote.mux`.
8. `packages/client/ui-slots/src/index.ts` + `docs/subsystems/slots.md` — slot model and hierarchy.
9. `packages/client/ui-conversation/src/client/conversation/assembler.ts` + `docs/subsystems/conversation.md` — node assembly.
10. `apps/desktop/src/main.ts` + `src/host-process.ts` + `src/preload-app.ts` — Electron carrier, IPC, bundled Host.
11. Docs: `docs/subsystems/web-client.md`, `client-modules.md`, `slots.md`, `conversation.md`, `web-server.md`, `docs/web-styling.md`, `docs/ui-radius.md`, `docs/user/guide/index.md` (Web UI usage), `docs/user/develop/{basic,framework,practice}/index.md` (plugin authoring).

## Constraints & gotchas

- `apps/web` is **not** a standalone app: bare `vite`/`vite preview` throws (`rejectStandaloneServe`) because only `dsh web` injects `__DSH_BOOT__`. `pnpm run dev:web` or `dsh web` are the only supported launches.
- Plugin packages never enter Vite's graph; they arrive as runtime bundles through `client-modules`. Rebuilding one requires `pnpm --filter <pkg> bundle` (or a dev watcher), not a page-only rebuild.
- Feature plugins must not runtime-import or re-export another feature plugin's values; cross-package behavior goes through injected Cordis services, UI through slots, declarations through `import type`.
- Slot `children` declaration is authorization. Undeclared renders and duplicate declarations fail at activation; `single` and occupied keyed cells are replacement points.
- Components never see `ctx`, never call `useSyncExternalStore`, and never create hooks as prop values; business data stays in the object layer, not in slot stores.
- `rpcId` is strictly bidirectional; Connection mints. `notifyNow` is for direct gesture echoes; structural updates use batched `markDirty`, streaming chunks `markFrameDirty`.
- Conversation append path is O(definitions) matches + keyed lookup: Definitions must not scan the event window, Contexts, or rendered nodes; packed Assistant runs are update-only and need both scalar and `chunkrow/*` branches.
- Client copy is locale-owned (`verify-client-ui-i18n` rejects hardcoded product text); English uses sentence case.
- Styling: `--dsw-*` semantic tokens, CSS Modules + `clsx`, no component library/Tailwind; menus must use `Menu`/`MenuSurface`; elevated surfaces use elevation shadows with `border: 0` (hairline is the first shadow layer); neutral borders are 0.5px; full-round radii pair with `corner-shape: round`.
- `dsh.client.inject` is informational only (activation order is Cordis service injection); `dsh.client.external` is not a feature-dependency mechanism, and `PLATFORM_MODULES` entries must not be repeated there.
- The `immediately` prefetch tier currently has 11 packages: `api/gateway`, `api/remotes`, `client/connection`, `client/file-upload`, `client/hmr`, `client/locale`, `client/modules`, `client/ui-renderer`, `client/ui-theme`, `experimental/inspector`, `typert/registry`.
- Desktop: only `dsh-app://app` frames get preload bridges; `set-cookie` never reaches the renderer; Host binds `127.0.0.1` on an OS-assigned port; the `desktop` profile is reserved and CLI-inaccessible; packaged main bundles inline workspace devDependencies and are gated by `apps/desktop/scripts/desktop-bundle-imports.mjs`.
- Desktop and Web share one release identity: Electron and `@deepseek-ai/dsh` versions must match exactly.
- GUI change ladder: `test:gui` always; add `DSH_SNAPSHOT=replay pnpm run test:web` whenever assembled output or conversation UI can change.

## Open questions

1. `apps/web` ships no README; its contract lives in `package.json.description` + `packages/client/web/README.md` — is that intentional or a doc gap? (unverified)
2. Shipped `settings.section` ids/orders are spread across `ui-settings-general` and each feature package; no single generated list was found in the packages inspected. (unverified)
3. The exact roster of `trajectory` Definitions beyond `trajectory-assistant-definition.ts` was not enumerated. (unverified)
4. Which `IndexInjection` rows exist beyond the boot graph (e.g. style/global rows from other plugins) was not exhaustively enumerated. (unverified)
5. Desktop packaging, signing, update channels, and the welcome window were only skimmed from `apps/desktop/README.md`; `apps/desktop/publishing/` and `windows-signing/README.md` remain unaudited.
