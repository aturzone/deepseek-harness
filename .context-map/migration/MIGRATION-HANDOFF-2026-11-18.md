# DSH contribution work — migration handoff (2026-11-18, host `sword` → Debian 13)

This file, `.context-map/` and the scripts under `.context-map/migration/` are force-added to the fork branch
`meta/context-map` so they survive the host wipe. Recover with:

```sh
git clone --branch meta/context-map https://github.com/aturzone/deepseek-harness.git dsh-meta
cp -a dsh-meta/.context-map ~/Documents/deepseek-harness/   # after re-cloning the project
```

## State at freeze (2026-11-18 before migration)

- Runtime host: **`@deepseek-ai/dsh@0.2.2-rc.3`** under staged **Node 24.22.2** (`~/.local/node24/bin/node`);
  wrapper `/home/atur/.local/bin/dsh` = `#!/bin/sh` + `exec ~/.local/node24/bin/node ~/.local/lib/node_modules/@deepseek-ai/dsh/lib/bin.js "$@"`.
  Host runs as `dsh web` in tmux session `dsh`, window 0.
- Upstream: **`0.2.2-rc.4`** released 2026-11-17T17:53Z; `origin/master` = **`ca33fd6843`** (+807 commits over rc.3).
  npm dist-tags: `next=0.2.2-rc.4`, `latest=0.2.2-rc.1`.
- Local checkout: `~/Documents/deepseek-harness`, `master` = `ca33fd6843`, worktree clean.
- Fork: `aturzone/deepseek-harness`, 20 branches (see table), `master` = `ca33fd6843` (fast-forwarded via API).
- Profile: `~/.dsh/profiles/web`; subagent plugins updated to `0.2.2-rc.3`; host log showed no incompatibility.
- Contribution scoreboard: upstream merged **0**; no maintainer replies. 18 patch branches are still rc.3-based and
  **807 commits behind**; the 2026-11-18 HMR fix is the newest branch (rc.4-based).

## Branch tips on the fork

| branch | tip | base |
|---|---|---|
| `fix/hmr-module-graph-child-filename` | `7e4bf5601d` | rc.4 (`ca33fd6843`) |
| `feat/locale-writing-direction` | `919abb1f1a` | rc.3 |
| `fix/dsh-bug-triage` | `8ecd9269fd` | rc.3 |
| `fix/schedule-completion-gate` | `59f53412de` | rc.3 |
| `fix/static-index-no-store` | `c0592b8d4f` | rc.3 |
| `fix/tool-result-well-formed` | `b724c5d461` | rc.3 |
| `fix/truncation-surrogate-pairs` | `9dcd0d16dd` | rc.3 |
| `fix/subprocess-managed-internals` | `0af1b8dee6` | rc.3 |
| `fix/effect-async-rejection` | `20e54b7762` | rc.3 |
| `fix/chat-tail-space-reclaim` | `7f79aa4da2` | rc.3 |
| `fix/hmr-transaction-context` | `6e45d490f0` | rc.3 |
| `fix/file-reference-scope-guard` | `f7a4c3adad` | rc.3 |
| `fix/profile-silent-reset-guard` | `9cbe9deaf3` | rc.3 |
| `fix/plugin-manager-update-line` | `160fee127e` | rc.3 |
| `fix/agent-preset-unknown-message` | `6871f1c092` | rc.3 |
| `fix/boot-launcher-runtime-version` | `1265c9be13` | rc.3 |
| `fix/windows-alias-executable` | `0fa5b1c989` | rc.3 |
| `docs/cordis-skill-replacement-restart` | `c116153892` | rc.3 |
| `docs/recovery-handwritten-rows` | `616bbf5c3b` | rc.3 |

Retired as upstream-fixed: `fix/open-in-app-electron-env`, `fix/desktop-cookie-cleanup-order` (both deleted).
The cookie-overflow fix shipped in rc.2/rc.3 (`5868dbc357`, `93bef27ec7`); the desktop handshake then moved to an IPC
`dsh-desktop-session` secret in master (`71753fdf91`).

## Bootstrap after migration (in order)

1. **Toolchain**: install Node **>= 24.9** (24.22.2 was used) + pnpm **11.28.5**. Network on the old host went through
   `HTTPS_PROXY=http://127.0.0.1:8119/`; adapt to the new host.
2. **Identity**: `git config --global user.name "Atur Dana"`, `user.email "aturzone@gmail.com"`; never `h.moosavi`.
   Repo-local credential helper: `!f() { echo "username=aturzone"; echo "password=$(gh auth token)"; }; f`.
3. **Clone**: `git clone https://github.com/aturzone/deepseek-harness` (fork) and `git remote add origin` upstream.
   Restore `.context-map` from `meta/context-map`.
4. **Workspace tools**: recreate `.tools/env.sh` (copy from `.context-map/migration/env.sh`) — PATH with workspace
   Node/pnpm, XDG dirs, `DSH_HOME=$PWD/.tools/dsh-home`, caches, git identity exports.
5. **Runtime**: `npm install -g @deepseek-ai/dsh@0.2.2-rc.4` using Node 24's npm, then write the wrapper
   (`~/.local/bin/dsh`) exactly as above; start `dsh web` inside tmux (`tmux new -s dsh`).
   Optional host plugins: `dsh plugin --profile web add @deepseek-ai/dsh-subagent-claude-code@0.2.2-rc.4`.
6. **Rebase queue** (one branch at a time, focused tests, `--force-with-lease`, push to fork):
   start with `fix/hmr-module-graph-child-filename` (already rc.4-based, no rebase needed) →
   `fix/dsh-bug-triage` → `fix/schedule-completion-gate` → `fix/tool-result-well-formed` →
   `fix/truncation-surrogate-pairs` → `fix/subprocess-managed-internals` → `fix/effect-async-rejection` →
   `fix/hmr-transaction-context` → `fix/file-reference-scope-guard` → `fix/profile-silent-reset-guard` →
   `fix/static-index-no-store` → `fix/agent-preset-unknown-message` → `fix/boot-launcher-runtime-version` →
   `fix/windows-alias-executable` → `fix/chat-tail-space-reclaim` → `fix/plugin-manager-update-line` →
   docs branches → `feat/locale-writing-direction` (RTL; also convert other client CSS packages and add `direction:'rtl'`
   to the Persian/Arabic locale packs).
   Re-check each against `origin/master` first: markers that mean "still needed" are `SessionTurnScopeError`,
   `wellFormedToolResult`, `CompletionGate`, `turnRunning`, `managedRunnerSeams` (all absent on rc.4).
7. **Runtime upgrade** on the new host: rc.4 (or newer `next`) with the same wrapper + tmux restart; verify
   `dsh --version`, host exe = Node 24, page/URL healthy. Profile plugins matching that version.
8. **Daily status check** (the previous schedule was deleted externally before its first delivery): recreate with
   `schedule_create`, title "DSH project daily status check", `DTSTART;TZID=Asia/Tehran:2026MMDDT093000`,
   `RRULE:FREQ=DAILY`, target `new_once`. Prompt skeleton: runtime version/upgrade check → upstream fetch + tag/npm
   delta → notifications/mentions with verified replies → branch currency + upstream-fixed retirement → profile plugin
   compatibility → dated ledger entry → short Persian report. Keep the honesty rule: merged upstream = 0 unless proven.

## Pitfalls learned on the old host (do not repeat)

- Never swap installed files under a live host: stop it first, then install, then restart.
- Liveness check must match the real cmdline `node .../lib/bin.js web` — `pgrep -f 'dsh web'` is a false negative and
  will roll back a working upgrade.
- The npm on this machine skips install scripts for 5 packages (`dsh-subprocess-local`, `node-pty`, `koffi`, ...);
  rc.3 still booted, but on the new host prefer `--allow-scripts=...` if a native dependency fails.
- Use the workspace pnpm (`.tools/pnpm/bin`, 11.28.5 under Node 24); the global pnpm shim hangs under Node 22.
- The repo pre-push hook runs the full typecheck; under Node 22 it dies with `--no-experimental-strip-types`. Push with
  the workspace Node first, or use `--no-verify` only with the checks recorded in the branch comment.
- Git HTTPS pushes to GitHub are flaky here (`GnuTLS handshake failed`): retry, or fast-forward a ref through the
  GitHub API (`PATCH /repos/aturzone/deepseek-harness/git/refs/heads/<branch>` with `force:false`).
- `gh api graphql` POST is flaky through the proxy; `curl -x http://127.0.0.1:8119/ -X POST https://api.github.com/graphql`
  with `Authorization: bearer $(gh auth token)` worked.
- Repo-wide `pnpm run typecheck` did not finish in 25 minutes on this host (host + client compilers passed); use
  `NODE_OPTIONS=--max-old-space-size=8192`, `DSH_GATE_CONCURRENCY=1`, and focused `tsc -b <package>` for branch work.

## Host profile snapshot

`profile-snapshot/` keeps the old host's user-owned DSH configuration (no credentials): the home `cordis.patch.yml`,
`profiles/web/cordis.patch.yml` (public URL, trusted hosts, connection cookie settings, OpenCode Go provider
reference by env name), `profiles/web/cordis.yml` and the profile `package.json` (bundle list). After reinstalling on
Debian 13, compare these with the generated profile and copy back the user-owned rows; do not copy
`~/.dsh/.credentials.yaml` (secrets stay in the vault).
