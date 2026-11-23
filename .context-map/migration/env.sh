# Source this before any pnpm/node command in this checkout:
#   source .tools/env.sh
# The DSH file sandbox only allows writes under the session workspace, so every
# cache, store, and DSH home this workspace needs lives under .tools/ (excluded
# from git). Node comes from the machine's nvm-managed v24.22.3, which satisfies
# the repository engines floor (^24.22.3).
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="$ROOT/.tools/pnpm-tool/node_modules/.bin:$PATH"
export XDG_DATA_HOME="$ROOT/.tools/xdg-data"
export XDG_CACHE_HOME="$ROOT/.tools/xdg-cache"
export XDG_STATE_HOME="$ROOT/.tools/xdg-state"
export DSH_HOME="$ROOT/.tools/dsh-home"
export npm_config_store_dir="$ROOT/.tools/pnpm-store"
export npm_config_cache="$ROOT/.tools/npm-cache"
export COREPACK_HOME="$ROOT/.tools/corepack"
# ~/.npmrc still carries the retired 127.0.0.1:8119 proxy while this host has
# direct network access. Point package managers at a workspace-local config so
# every cache/store/proxy decision stays inside the sandbox and under review.
export NPM_CONFIG_USERCONFIG="$ROOT/.tools/npmrc"
# Owner identity for every commit this workspace produces. NEVER author as
# h.moosavi: the owner is Atur Dana (a.dana) <aturzone@gmail.com>.
export GIT_AUTHOR_NAME="Atur Dana"
export GIT_AUTHOR_EMAIL="aturzone@gmail.com"
export GIT_COMMITTER_NAME="Atur Dana"
export GIT_COMMITTER_EMAIL="aturzone@gmail.com"
unset ROOT
