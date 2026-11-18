#!/usr/bin/env bash
# Restart the tmux-hosted `dsh web` host to activate the updated profile plugins.
set -uo pipefail
LOG=/home/atur/.local/state/dsh-restart.log
exec >>"$LOG" 2>&1
echo "=== $(date -Is) dsh host restart start ==="
NODE24=/home/atur/.local/node24
export PATH="/home/atur/.local/bin:$NODE24/bin:/usr/local/bin:/usr/bin:/bin"
unset DSH_HOME
tmux has-session -t dsh 2>/dev/null || { echo "no tmux dsh session"; exit 1; }
tmux send-keys -t dsh:0 C-c 2>/dev/null || true
for _ in $(seq 1 20); do pgrep -f 'lib/bin.js web' >/dev/null || break; sleep 1; done
pkill -f 'lib/bin.js web' 2>/dev/null || true
sleep 2
echo "version: $(dsh --version 2>&1 | head -1)"
tmux send-keys -t dsh:0 'echo DSH_RESTART_MARKER' Enter
sleep 1
tmux send-keys -t dsh:0 'env -u DSH_HOME dsh web' Enter
UP=no
for _ in $(seq 1 60); do
  if tmux capture-pane -p -t dsh:0 -S -300 2>/dev/null | awk '/DSH_RESTART_MARKER/{f=1} f' | grep -q 'dsh web: '; then UP=yes; break; fi
  sleep 1
done
PID=$(pgrep -f 'lib/bin.js web' | head -1)
echo "host up=$UP pid=${PID:-none} exe=$(readlink -f /proc/${PID:-0}/exe 2>/dev/null)"
echo "=== $(date -Is) end ==="
