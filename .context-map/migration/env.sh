# Source this before any pnpm/node command in this checkout:
#   source .tools/env.sh
export PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.tools/node/bin:$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/pnpm/bin:$PATH"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export XDG_DATA_HOME="$ROOT/.tools/xdg-data"
export XDG_CACHE_HOME="$ROOT/.tools/xdg-cache"
export XDG_STATE_HOME="$ROOT/.tools/xdg-state"
export DSH_HOME="$ROOT/.tools/dsh-home"
export npm_config_store_dir="$ROOT/.tools/pnpm-store"
export npm_config_cache="$ROOT/.tools/npm-cache"
# Owner identity for every commit this workspace produces. NEVER author as
# h.moosavi: the owner is Atur Dana (a.dana) <aturzone@gmail.com>.
export GIT_AUTHOR_NAME="Atur Dana"
export GIT_AUTHOR_EMAIL="aturzone@gmail.com"
export GIT_COMMITTER_NAME="Atur Dana"
export GIT_COMMITTER_EMAIL="aturzone@gmail.com"
unset ROOT
