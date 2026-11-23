# Debian 13 workspace bootstrap — 2026-11-23

State of the fresh contribution workspace after the `sword` → Debian 13 (`Sebastian`) migration.
The migration plan is `MIGRATION-HANDOFF-2026-11-18.md`; this file records what actually exists now.

## Layout and versions

| Item | Value |
|---|---|
| Host | Debian 13.8 `Sebastian`, user `atur` |
| Workspace | `/home/atur/Workspace/deepseek-harness` (single clone of the fork, on `master` @ `4b399c39a6`) |
| Fork | `aturzone/deepseek-harness` (origin, HTTPS); `upstream` remote = `deepseek-ai/deepseek-harness` (read-only) |
| Upstream master | `4b399c39a6` = `dsh-v0.2.3-alpha.2` (2026-11-22); fork `master` current at the same commit |
| npm dist-tags | `latest` = `next` = `0.2.2-rc.5`; `alpha` = `0.2.3-alpha.2` |
| Installed runtime | `dsh --version` = **0.2.2-rc.1** — upgrade intentionally not executed mid-session (restart changes the GUI URL) |
| Node | v24.22.3 via nvm (`~/.nvm/versions/node/v24.22.3`), satisfies `engines.node` |
| pnpm | 11.28.5 installed workspace-locally: `.tools/pnpm-tool/node_modules/.bin/pnpm` |
| Toolchain env | `.tools/env.sh` (copied here as `env.sh`); `.tools/npmrc` holds the registry line only |

## Why the toolchain is workspace-local

- The DSH file sandbox allows writes **only under the session workspace**, so npm/pnpm stores, XDG
  dirs, and `DSH_HOME` must live inside it: `.tools/{pnpm-store,npm-cache,xdg-*,dsh-home}`.
- `~/.npmrc` on this host still points at the retired proxy `http://127.0.0.1:8119/`, and npm ignores
  an empty `npm_config_proxy` override. `NPM_CONFIG_USERCONFIG=$ROOT/.tools/npmrc` bypasses it; the
  network is direct on this host.
- The nvm `pnpm` shim self-installs the pinned `packageManager` version through the dead proxy, so
  pnpm 11.28.5 is installed once with `npm install --prefix .tools/pnpm-tool pnpm@11.28.5` and put
  first on `PATH` by `env.sh`.
- `CI=true pnpm install` is used because the postinstall hook installer is unnecessary while hooks
  are installed explicitly (`node scripts/install-lefthook.mjs`, `core.hooksPath=.git/dsh-hooks`).

## Git transport

- SSH to github.com is broken system-wide (`/etc/ssh/ssh_config.d/*` owned by `nobody:nogroup`,
  `sudo` unavailable), so `origin` uses HTTPS with the `gh auth git-credential` helper.
- HTTPS is occasionally flaky (`GnuTLS, handshake failed`); retry, or publish a ref through the
  GitHub API as before.
- Commit identity comes from `env.sh` (`Atur Dana <aturzone@gmail.com>`); never `h.moosavi`.

## Measured verification (2026-11-23)

- `CI=true pnpm install --frozen-lockfile`: success in 3m07s.
- HMR package tests: 240 passed (10 files) in ~22 s; focused `tsc -b packages/boot/hmr`: 3 s.
- Repo-wide `pnpm run typecheck`: 5/5 gates passed in 157 s — the pre-push hook is affordable here,
  so pushes run it instead of bypassing hooks.
- `git merge-tree --write-tree` simulation of all 19 prepared branches against `origin/master`:
  10 merge clean, 9 conflict (tool-result, dsh-bug-triage, hmr-transaction-context,
  boot-launcher-runtime-version, profile-silent-reset-guard, effect-async-rejection,
  windows-alias-executable, locale-writing-direction, docs/cordis-skill-replacement-restart).

## Still open

1. Runtime upgrade 0.2.2-rc.1 → 0.2.2-rc.5 (or alpha line) in a supervised window; profile plugins
   must match, and the GUI URL changes on restart.
2. The daily status-check schedule was not recreated; recreate only on Atur's explicit request.
3. `dsh-session-doctor` npm publish remains blocked on account 2FA (GitHub install works).
