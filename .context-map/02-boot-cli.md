# Boot, CLI, profiles, bundles

## One-line purpose

`dsh` is the only supported Node application launcher: it resolves a named profile in `$DSH_HOME/profiles/<name>`, stacks an ordered YAML patch stack (bundle layers → profile patch → home patch → `--patch` → telemetry switch) over an empty Cordis entry list, installs one immutable runtime module resolution, and boots the composed plugin tree — the bundle a profile names decides whether that tree ends in a Web server, a one-shot headless runner, an SDK JSON-RPC server, or an ACP stdio bridge.

## Package inventory

| Path | Package name | Role | Key src files |
|---|---|---|---|
| `apps/cli` | `@deepseek-ai/dsh` (bin `dsh` → `lib/bin.js`) | Launcher grammar, profile boot, plugin management, config dumps, diagnostics, bounded shutdown | `src/args.ts`, `src/bin.ts`, `src/profile-boot.ts`, `src/plugin.ts`, `src/dump-config.ts`, `src/dump-config-schema.ts`, `src/process-shutdown.ts`, `src/startup-diagnostics.ts`, `src/sdk-source.cordis.patch.yml` |
| `packages/boot/app-boot` | `@deepseek-ai/dsh-app-boot` | Boot library: layered env, profile load/init, bundle resolution, patch composition, runtime resolution, fail-loud, config-schema collection | `src/index.ts`, `src/profile.ts`, `src/profile-context.ts`, `src/profile-plugins.ts`, `src/profile-sanitize.ts`, `src/bundle-platform.ts`, `src/compatibility-preflight.ts`, `src/profile-resolution/`, `src/config-schema/` |
| `packages/boot/cmdline` | `@deepseek-ai/dsh-cmdline` | Immutable launcher→app argv handoff (`cmdlineArgs`, `appExit`, `appReady`) + commander adapter | `src/index.ts` |
| `packages/boot/plugin-manager` | `@deepseek-ai/dsh-plugin-manager` | Profile plugin/bundle install, selection, version exemptions; shared by CLI, Web sidebar, `plugin_manager` tool | `src/`, `src/operations*` (subpath `@deepseek-ai/dsh-plugin-manager/operations`), `src/tools` |
| `packages/boot/plugin-market` | `@deepseek-ai/dsh-plugin-market` | Reads user-configured market indexes; installation status/compat annotations; `plugin_market` tool | `src/` |
| `packages/boot/config-editor` | `@deepseek-ai/dsh-config-editor` | Validates and saves plugin config into the active profile patch, then reconciles | `src/` |
| `packages/boot/hmr` | `@deepseek-ai/dsh-hmr` | One queue for module replacement, Include refresh, profile patch reload | `src/index.ts` |
| `packages/bundle/base` | `@deepseek-ai/dsh-base` | Shared first layer for web/headless/sdk/acp: model adapters, tools, sessions, sandbox+approval, settings, credentials, telemetry (97 `- id:` lines, nested inserts included) | `cordis.patch.yml`, `src/index.ts` (no runtime API) |
| `packages/bundle/web-app` | `@deepseek-ai/dsh-web-app` | Browser surface over base: web host rows, browser roster, preset registry | `cordis.patch.yml`, `presets/{standard,ptc,minimal,cordis}.patch.yml`, `src/index.ts`, `src/startup.ts`, `src/public-url.ts` |
| `packages/bundle/headless` | `@deepseek-ai/dsh-headless` | One-shot task mode over base; no server/port | `cordis.patch.yml`, `src/index.ts` (runner, exports `./startup`), `src/startup.ts` |
| `packages/bundle/sdk-app` | `@deepseek-ai/dsh-sdk-app` | SDK JSON-RPC stdio application over base | `cordis.patch.yml`, `src/index.ts` (zero-option command provider) |
| `packages/bundle/sdk-minimal` | `@deepseek-ai/dsh-sdk-minimal` | Standalone complete tree, deliberately excludes `dsh-base` | `cordis.patch.yml` (37 rows), `src/index.ts` |
| `packages/bundle/acp-app` | `@deepseek-ai/dsh-acp-app` | Automation-only ACP stdio application over base | `cordis.patch.yml`, `src/index.ts` |
| `packages/sdk/protocol` | `@deepseek-ai/dsh-sdk-protocol` | Newline-delimited JSON-RPC wire types | `src/` |
| `packages/sdk/client` | `@deepseek-ai/dsh-sdk-client` | Spawns `dsh --profile sdk` with `dshHome` + ordered `patches`; owns subprocess teardown | `src/` |
| `packages/sdk/server` | `@deepseek-ai/dsh-sdk-jsonrpc-server` | Stdio JSON-RPC server plugin mounted by `sdk` / `sdk-minimal` | `src/` |
| `packages/acp/acp` | `@deepseek-ai/dsh-acp` | ACP v1 server plugin mounted by the `acp` profile | `src/` |
| `packages/util/official-bundles` | `@deepseek-ai/dsh-official-bundles` | `PROFILE_TEMPLATES`, `DEFAULT_PROFILE_BUNDLES`, `OPTIONAL_BUNDLES`, `ON_DEMAND_BUNDLES`, `RETIRED_BUNDLES`, offline catalog | `src/bundles.ts`, `src/plugin-manager.ts`, `src/catalog.generated.ts` |
| `packages/util/package-manifest` | `@deepseek-ai/dsh-package-manifest` | `dsh.bundle` / `dsh.profile` / `dsh.client` / `engines.dsh` manifest types | `src/types.ts` |
| `packages/util/home-paths` | `@deepseek-ai/dsh-home-paths` | `resolveDshHome()`: explicit path → `$DSH_HOME` → `~/.dsh`; blank ignored | `src/index.ts` |
| `packages/util/launch-environment` | `@deepseek-ai/dsh-launch-environment` | Frozen inherited/`.env` snapshot with per-value source (`DSH_LAUNCH_ENVIRONMENT_KEY`) | `src/` |
| `apps/plugin-market-generator` | `@deepseek-ai/dsh-plugin-market-generator` (private, not a Cordis app) | Reference generator: npm/Git source list → `index.json` for Discover | `src/bin.ts`, `src/cli.ts`, `src/generate.ts`, `src/sources.ts`, `src/metadata.ts` |

Note: there is no repo-root `config/`; the launcher-adjacent config directory is `apps/cli/config/` (examples only: `examples/ptc.yml`, `examples/mcp-memory/*.cordis.yml`). A second, unrelated one is `apps/desktop/config/`.

## Launcher & entry modes

Grammar (`apps/cli/src/args.ts`, commander configured `helpOption(false)`, `allowUnknownOption`, `passThroughOptions`, `enablePositionalOptions`):

```
dsh [--profile] <name> [launcher-flags] [app-args...]
dsh plugin --profile <name> <pnpm-args...>
```

- `dsh <name>` is rewritten to `dsh --profile <name>` before parsing, but only when the first token is not an option and is not `plugin`; a profile literally named `plugin` needs `dsh --profile plugin`.
- Launcher flags end at the first token it does not recognize; everything after is handed verbatim to the booted tree through `ctx.cmdlineArgs`. `dsh web --port 8080` → app arg; `dsh web --help` → web app help, not launcher help; `dsh -h`/`--help` with no profile prints launcher help.
- Launcher flags must precede app args; the parser consumes one `--`, so a literal `--` needs `-- --`. Repeated `--profile` is rejected. `--patch` is repeatable, single-value (never variadic, or it would swallow app args).
- `desktop` is reserved: boot and both dump modes reject it; `dsh plugin --profile desktop` is rejected by the npm CLI and allowed only for the Desktop-installed carrier (`manageDesktopProfile`).

| Invocation | Behavior |
|---|---|
| `dsh <name>` / `dsh --profile <name>` | Boot `$DSH_HOME/profiles/<name>`; auto-initialize shipped templates (`web`, `headless`, `sdk`, `sdk-minimal`, `acp`) on first use; unknown names fail with a `dsh plugin --profile <name> add <package>` hint |
| `--from-default-profile <template>` | Replace the custom target with a fresh copy of a shipped template (staging dir + rename; previous directory deleted, dependencies/patch not inherited) |
| `--dump-config` | Print composed YAML entry list; no boot, `!!js` unevaluated; adds profile + home + `--patch` layers |
| `--dump-default-config` | Bundle layers only; rejects `--patch` |
| `--dump-config-schema` | Compose (without applying) and print JSON Schema 2020-12; imports composed modules |
| `dsh plugin --profile <name> <pnpm...>` | Initialize profile if missing, then forward argv to pnpm in the profile dir; afterwards reconcile `dsh.profile.bundles`; also parses `allow-version`, `revoke-version`, `version-exemptions` |
| `dsh web` / `headless` / `sdk` / `sdk-minimal` / `acp` | Profile shorthand; each app owns its own flags (below) |

`src/bin.ts` dynamically imports only the selected runner (`runProfile` / `runPlugin` / `runDumpConfig` / `runDumpConfigSchema`). In profile mode it snapshots the layered environment (`loadLayeredEnv('dsh')`) before boot.

Runner selection is a property of the composed bundle, not the launcher: each mode bundle inserts a startup provider that parses the app's flags and a runner row that injects it.

| Profile | Runner row (bundle patch) | App flags |
|---|---|---|
| `web` | `webserver` / `web-runtime` / `connection` rows + `@deepseek-ai/dsh-web-app` glue | `--host`, `--port`, `--tls-cert`, `--tls-key`, `--public-url`, repeatable `--trusted-host`, `--no-open`, `-h` |
| `headless` | `headless-runner` (`@deepseek-ai/dsh-headless`) injecting `headlessStartup` | positional task (or `-`/stdin), `--json`, `--session-id`, `--permission-mode`, `--approval-policy`, `--add-dir`, `-h` |
| `sdk` / `sdk-minimal` | `sdk-jsonrpc-server` (`@deepseek-ai/dsh-sdk-jsonrpc-server`) injecting `sdkAppStartup` | none; stdio carries JSON-RPC |
| `acp` | `acp` (`@deepseek-ai/dsh-acp`) injecting `acpAppStartup`, default `deepseek-official` / `deepseek-v4-flash` | none; stdio carries ACP |

Process lifetime: `runProfile` installs the proxy resolver from the launch snapshot before any entry mounts, provides `profileContext` + launch environment + `PluginPackages` (runtime resolution) + `provideCmdline`, then mounts the tree over `<profile>/cordis.yml` (always rewritten to `[]`). SIGTERM exits 0, SIGINT exits 130, first signal starts a 5 s graceful drain (`src/process-shutdown.ts`), a second signal forces exit. One-shot headless exits 0 for `completed`, 1 otherwise. Required-plugin startup failure exits 1 and writes `$DSH_HOME/logs/startup-<ts>-<uuid>.log` (0600); if that write fails the full report goes to stderr.

## Profile/bundle/patch layer composition

Order is fixed and identical for boot and both dumps (`packages/boot/app-boot/src/profile-context.ts: readProfilePatches`, mirrored by `apps/cli/src/dump-config.ts: collectConfigDumpLayers`):

1. Empty root entry list — `<profile>/cordis.yml` containing `[]` (rewritten on every boot so Loader write-back cannot bake composed rows into it; exists only to anchor `baseUrl`).
2. Each bundle's patch files, in `dsh.profile.bundles` order. A bundle declares `dsh.bundle.patch` (string or ordered array; `bundlePatchFiles`/`bundlePatchPaths` in `profile.ts`). `web-app` is the only shipped bundle with an array: `cordis.patch.yml` then `presets/{standard,ptc,minimal,cordis}.patch.yml`.
3. The profile's own `cordis.patch.yml` (`PROFILE_PATCH_FILENAME`).
4. `$DSH_HOME/cordis.patch.yml` — machine-local, applied after the per-profile layer, so it outranks it.
5. Each `--patch <path>` overlay in argv order.
6. Launcher-generated telemetry patch: any non-empty `DSH_TELEMETRY_DISABLED` sets `session-telemetry-otel` `disabled: true` (only when that row exists).

Layer semantics:

- A patch is a top-level YAML array of loader patch entries: `- id: <row>` (replace that row's complete `config`/`disabled`), or `- insert: [rows...]`, plus nested `group`/`include` forms. Later layers win per row; **config replacement is whole-value, never a deep merge** — restate every field you keep.
- A patch naming an absent id warns on stderr; an empty or comments-only patch file fails the boot (`must be a top-level YAML array`); disable a layer with `[]`.
- `!!js` is allowed under plugin `config` and entry `disabled` only (`!!js "condition"`, never `!js`). Inserted plugin names may be absolute paths, file URLs, or package specifiers; patch-relative `./`/`../` names become file URLs.
- A `preset` patch applies the same operations inside that preset declaration's `config.plugins`, with the same layer precedence.
- HMR is a row (`hmr` in `dsh-base`, `disabled: !!js "!ctx.get('profileContext')"`, `root: []` = config-only watching). `headless`, `sdk-app`, `acp-app` patch it `disabled: true`; `sdk-minimal` omits it. So only `web` (base default) hot-reloads configuration.
- Bundle resolution (`resolveBundleDir`) tries the **dsh installation anchor first**, then the profile directory — in-box bundles always come from the running installation; out-of-tree bundles from profile `node_modules`.
- A selected bundle is **skipped, not fatal**, and reported once via `reportSkippedBundles` when: its package is unresolvable/unreadable, it declares no `dsh.bundle`, `dsh.bundle.platforms` excludes `process.platform` (e.g. `packages/experimental/cua-bundle` → `["darwin"]`), or its own `engines.dsh`/DSH peer ranges reject the runtime without an exemption. A malformed profile `package.json` or broken user patch still fails startup.
- Before rows mount, `createRuntimeResolution` builds one immutable runtime table (installation first, then ordered bundle dependency graphs) and installs it into Node's ESM/CJS resolvers via `PluginPackages`; no fallback or profile symlinks are created.
- Electron Desktop does not use the shared `$DSH_HOME/profiles` lookup: `apps/desktop-host/src/index.ts` calls `runProfile({ ..., resolvedProfile: { profile, installAnchor } })` (loaded with `loadProfileDirectory`), keeping the home patch, proxy, telemetry switch, and shutdown.

## Config schema & generated catalogs

- `docs/config-catalog.md` — generated by `scripts/gen-config-catalog.ts` (`pnpm run gen-config-catalog`, checked by `verify-config-catalog` inside `doc-sync`). Per loadable package it pastes the verbatim `Config` declaration (JSDoc included) inside `ts config-catalog` fences and cross-checks the Schemastery runtime schema against it; it labels `inject`, `refs`, `source`. Example: `@deepseek-ai/dsh-headless` → task/sessionId/json/permissionMode/approvalPolicy (`packages/bundle/headless/src/index.ts`). Bundles themselves are not config: their surface is the YAML patch.
- `--dump-config` — `renderConfigDump` prints one loadable YAML document with `# ==` comments naming each source file/layer, `!!js` expressions verbatim, unmatched targets reported with their layer; boot-free, so it never runs app command-line providers. It **initializes missing profile files** (writes manifest/patch/`pnpm-workspace.yaml`) and rejects invocations carrying app args.
- `--dump-config-schema` — `generateConfigSchema` composes without applying and prints JSON Schema 2020-12: root describes the parsed entry list, `$defs.patchList` describes overlays, `x-cordis` carries `profile`, `complete`, `entries` (path/id/name/status/configRef), `diagnostics`, `patchSchema`. Partial/unsupported projections set exit code 1 with partial stdout. It **imports** composed modules (trusted code; may run getters/builders) — never point it at untrusted plugins.
- `docs/cli-help.md` — generated by `scripts/gen-cli-help.ts` (invokes the real launcher and each profile's `--help`; `pnpm run gen-cli-help` / `verify-cli-help`). Contains launcher, `plugin`, and all shipped-surface help verbatim.
- `apps/cli/composition.md` — generated by `scripts/gen-doc-graphs.ts` (`gen-doc-graphs`) from `cordis.patch.yml`; renders base composition and per-profile Mermaid graphs.
- Market indexes: `apps/plugin-market-generator` writes a validated `index.json` (`@deepseek-ai/dsh-plugin-market-index` format); `packages/boot/plugin-market` reads configured indexes and annotates installable entries; Discover UI and `plugin_market` tool consume it; installation always goes through `pluginManager.installBundle`.

## How to extend

1. **Insert a plugin row into one profile.** Append to `$DSH_HOME/profiles/<name>/cordis.patch.yml`:
   ```yaml
   - insert:
       - id: tool-str-replace-editor
         name: '@deepseek-ai/dsh-tool-str-replace-editor'
         config: { maxOutputChars: 16000 }
   ```
   Verify with `dsh --profile <name> --dump-config` before booting. Live-applies only where HMR is enabled (web).
2. **Change a composed row.** Target it by id and restate the whole config; keep `!!js` expressions if the flag must keep winning (a literal replaces the flag read):
   ```yaml
   - id: webserver
     inject: [webStartup]
     config:
       host: !!js ctx.webStartup.host ?? '127.0.0.1'
       port: !!js ctx.webStartup.port ?? 3080
   ```
3. **One-invocation overlay.** `dsh web --patch apps/cli/config/examples/ptc.yml` switches native→PTC tool execution; `--patch` paths resolve against the invoking directory and must exist.
4. **Author a bundle.** New package declares `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }` (+ optional `platforms`, `listedByDefault`), exports `./cordis.patch.yml`; install with `dsh plugin --profile <name> add <pkg-or-git-spec>` (pnpm reconciles the bundle list on success); restart the profile — bundle membership is a startup boundary.
5. **New custom profile from a shipped template.** `dsh rescue --from-default-profile web` then edit `$DSH_HOME/profiles/rescue/cordis.patch.yml`; target name may not be a shipped name in any case. The copy holds the template's bundle list only.
6. **Add a shipped surface.** One new bundle package + one `PROFILE_TEMPLATES` entry in `packages/util/official-bundles/src/bundles.ts`; do **not** add a second bin — `scripts/verify-application-entrypoints.ts` rejects any Node app path bypassing `dsh`.

## Where to look first

1. `apps/cli/src/args.ts` — complete launcher grammar and mode dispatch.
2. `apps/cli/src/profile-boot.ts` — profile prep, layer composition, `runProfile` lifecycle, shutdown wiring.
3. `packages/boot/app-boot/src/profile-context.ts` — the authoritative 6-step layer order incl. home patch and telemetry switch.
4. `packages/boot/app-boot/src/profile.ts` — profile init, bundle resolution/skip rules, `composeEntries`.
5. `packages/bundle/base/cordis.patch.yml` — the ~97-row shared core every base-backed profile patches over.
6. `apps/cli/reference/README.md` — exact flags, precedence, dump semantics, plugin management, source execution.
7. `packages/util/official-bundles/src/bundles.ts` — which bundles each shipped profile starts with.
8. `packages/boot/cmdline/src/index.ts` — `cmdlineArgs`/`appExit`/`appReady` contract and flag-beats-config mechanism.
9. `docs/cli-help.md` — complete generated help for launcher + every shipped profile.
10. `apps/cli/composition.md` — generated per-profile plugin graphs.

## Constraints & gotchas

- **No second launcher.** Package bins, demos, and "SDK argv" app paths are forbidden (`docs/architecture.md#application-launch`, `scripts/verify-application-entrypoints.ts`); `dsh` is the allowlisted bin (plus the build-only `dsh-pack-vfs-image`).
- **Patch = replace, not merge.** Overriding one key requires restating the row's full config. A user patch that replaces `config` with literals also silently kills flag-beats-config precedence for that row.
- **Ordering surprises:** home `$DSH_HOME/cordis.patch.yml` beats the profile patch; `--patch` beats both; within `--patch` argv order, last wins. Bundle `enabled` toggled by the plugin manager appends at the END of `dsh.profile.bundles`, changing precedence.
- **Launcher flag placement:** first unrecognized token starts app args; `--patch` after an app flag belongs to the app; one `--` is consumed.
- **Reserved/profile-name rules:** `desktop` rejected; profile names with `/`, `\`, `.`, `..`, `node_modules`, or empty are invalid; shipped names are reserved for `--from-default-profile` targets (case-insensitive).
- **Dumps mutate.** A dump initializes missing profile files; `--dump-config-schema` imports plugin code; the three dump flags are mutually exclusive and reject app args; `--dump-default-config` rejects `--patch`.
- **Empty patch file fails boot** (comments-only included) — use `[]` to disable a layer.
- **`sdk-minimal` is not base-backed.** It omits settings, managed credentials, permission presets, telemetry, text file tools, skills, jobs, subagents, SQLite; it pins `danger-full-access`. Patches written for base-backed profiles do not apply.
- **Headless credentials.** `headless` disables `credentials`, `authorization`, `deepseek-account`; keys come from the launch env → invocation `.env` → `$DSH_HOME/.env`; GUI-saved sign-ins are ignored unless those rows are re-enabled in a patch.
- **HMR scope.** Headless/SDK/ACP mount HMR disabled; bundle membership changes always need a restart; `dsh plugin` package operations run outside the HMR queue and take the profile write lock.
- **Source vs installed launch.** `pnpm dsh <args>` runs `node --import tsx/esm apps/cli/src/bin.ts` (ESM-only hook; modules it reaches must stay ESM). Production needs built artifacts; the launcher never checks freshness. Missing Typert artifacts fail boot; missing frontend/client bundles fail with a `pnpm run build` hint.
- **Service-collision loads fail loudly:** e.g. adding `dsh-fs-local` beside the sandboxed `fs-sandbox` double-registers `ctx.fs`; the Windows shell swap must disable both `pwsh-*` rows and enable both `bash-*` rows.
- **Local sandbox safety rails:** Web `--host` accepts one concrete local address (wildcard rejected); `--tls-cert`/`--tls-key` are all-or-nothing and never fall back to HTTP.
- **pnpm needed for extension:** `dsh plugin` needs `pnpm` on `PATH` (or `pnpmCommand`); git-hosted plugins that build via `prepare` need an `allowBuilds` entry in the profile's `pnpm-workspace.yaml` before a second `add`.
- **Startup diagnostics may contain secrets.** The saved log and stderr report include raw plugin errors/config values; unredacted by design, warn readers before sharing.
- **Doc freshness gates:** `verify-cli-help`, `verify-config-catalog`, `verify-doc-graphs` run inside `doc-sync`; editing `docs/cli-help.md` or `docs/config-catalog.md` by hand fails.
- **Unverified here:** exact composition of `apps/desktop/config/` (not read), and runtime behavior of third-party bundles installed into a profile (only shipped manifests were read).

## Open questions

1. Is `--dump-config` YAML intended to become a stable machine-consumed contract? `packages/boot/app-boot/README.md` (Dev Note) says byte stability is undecided, while the schema dump is explicitly pre-stable.
2. Is there an intended cookbook path for adding a sixth shipped profile (bundle + `PROFILE_TEMPLATES` + docs + CLI help regeneration), or is `docs/cookbook/adding-a-package.md` the only written procedure?
3. Should `dsh.bundle.platforms` be used by shipped optional bundles (`OPTIONAL_BUNDLES`) the way `cua-bundle` uses `["darwin"]` — i.e. is platform gating the recommended mechanism versus `disabled: !!js process.platform === ...` rows?
4. Does any surface other than Web consume `ctx.appReady`, or is readiness effectively Web-only in shipped profiles? (`apps/cli/src/profile-boot.ts` commits it for every profile when a Loader exists.)
5. Are out-of-tree bundles expected to pin `engines.dsh`, or rely on `peerDependencies` ranges? Both are enforced by `evaluatePluginCompatibility`, and the market generator normalizes them, but which is the recommended authoring default is not stated in one place.
