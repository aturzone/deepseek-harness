#!/usr/bin/env bash
# One-shot: switch the tmux-hosted `dsh web` to 0.2.2-rc.3 under staged Node 24.
# Attempt 2: the previous run rolled back because its liveness check looked for
# "dsh web" in the process command line, but the wrapper runs `node .../lib/bin.js web`.
set -uo pipefail
LOG=/home/atur/.local/state/dsh-upgrade.log
exec >>"$LOG" 2>&1
echo "=== $(date -Is) rc.3 upgrade attempt 2 start ==="
NODE24=/home/atur/.local/node24
NPM="$NODE24/bin/npm"
DSH_BIN=/home/atur/.local/bin/dsh
DSH_PKG=/home/atur/.local/lib/node_modules/@deepseek-ai/dsh
export PATH="/home/atur/.local/bin:$NODE24/bin:/usr/local/bin:/usr/bin:/bin"
unset DSH_HOME
tmux has-session -t dsh 2>/dev/null || { echo "no tmux dsh session"; exit 1; }
echo "stopping current host"
tmux send-keys -t dsh:0 C-c 2>/dev/null || true
for _ in $(seq 1 20); do pgrep -f '/home/atur/.local/bin/dsh web' >/dev/null || break; sleep 1; done
pkill -f '/home/atur/.local/bin/dsh web' 2>/dev/null || true
pkill -f 'lib/bin.js web' 2>/dev/null || true
sleep 2
echo "installing @deepseek-ai/dsh@0.2.2-rc.3"
if ! "$NPM" install -g @deepseek-ai/dsh@0.2.2-rc.3; then
  echo "rc.3 install failed; rolling back"
  "$NPM" install -g @deepseek-ai/dsh@0.2.2-rc.1 || echo "rollback install failed"
fi
rm -f "$DSH_BIN"
cat > "$DSH_BIN" <<WRAP
#!/bin/sh
exec $NODE24/bin/node $DSH_PKG/lib/bin.js "\$@"
WRAP
chmod +x "$DSH_BIN"
echo "wrapper version: $("$DSH_BIN" --version 2>&1 | head -1)"
echo "restarting host"
tmux send-keys -t dsh:0 'echo RC3_UPGRADE_MARKER' Enter
sleep 1
tmux send-keys -t dsh:0 'env -u DSH_HOME dsh web' Enter
UP=no
for _ in $(seq 1 75); do
  if tmux capture-pane -p -t dsh:0 -S -300 2>/dev/null | awk '/RC3_UPGRADE_MARKER/{f=1} f' | grep -q 'dsh web: '; then UP=yes; break; fi
  sleep 1
done
PID=$(pgrep -f 'lib/bin.js web' | head -1)
echo "host up=$UP pid=${PID:-none} exe=$(readlink -f /proc/${PID:-0}/exe 2>/dev/null)"
if [ "$UP" != yes ] || [ -z "$PID" ]; then
  echo "rc.3 host failed; rolling back"
  "$NPM" install -g @deepseek-ai/dsh@0.2.2-rc.1
  tmux send-keys -t dsh:0 'env -u DSH_HOME dsh web' Enter 2>/dev/null || true
  sleep 25
fi
echo "final version: $("$DSH_BIN" --version 2>&1 | head -1)"
PID=$(pgrep -f 'lib/bin.js web|/home/atur/.local/bin/dsh web' | head -1)
echo "final pid=${PID:-none} exe=$(readlink -f /proc/${PID:-0}/exe 2>/dev/null)"
echo "=== $(date -Is) end ==="
