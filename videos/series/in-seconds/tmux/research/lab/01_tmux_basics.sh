#!/usr/bin/env bash
# tmux 3.4 on Ubuntu (WSL2): server/client, sessions, windows, panes, ptys,
# default prefix table, detach and reattach. Run inside the Linux environment:
#   bash 01_tmux_basics.sh > out_01_tmux_basics.txt 2>&1
set -u
export LC_ALL=C.UTF-8
SOCK=ftlab
WORK=/tmp/ft-tmux-lab
T() { tmux -L "$SOCK" -f /dev/null "$@"; }

T kill-server 2>/dev/null || true
rm -rf "$WORK"
mkdir -p "$WORK"
trap 'T kill-server 2>/dev/null || true' EXIT

echo "## 1. version and kernel"
tmux -V
uname -srm

echo
echo "## 2. start a detached session (no client attached)"
T new-session -d -s demo -c "$WORK" 'bash --norc'
T list-sessions -F 'session=#{session_name} windows=#{session_windows} attached=#{session_attached} created=#{session_created}'

echo
echo "## 3. server pid, socket path, client count"
T display-message -p 'server_pid=#{pid} socket=#{socket_path} session=#{session_name}'
SERVER_PID=$(T display-message -p '#{pid}')
SOCKET_PATH=$(T display-message -p '#{socket_path}')
printf 'socket stat: '
stat -c '%F mode=%a owner_uid=%u' "$SOCKET_PATH"
printf 'server exe: '
readlink "/proc/$SERVER_PID/exe"
printf 'server fd 0: '
readlink "/proc/$SERVER_PID/fd/0"

echo
echo "## 4. pane process and its controlling terminal"
T list-panes -a -F 'target=#{session_name}:#{window_index}.#{pane_index} pane_pid=#{pane_pid} tty=#{pane_tty} dead=#{pane_dead} cmd=#{pane_current_command}'
PANE_PID=$(T display-message -p -t demo:0.0 '#{pane_pid}')
ps -o pid,ppid,tty,stat,comm,args -p "$PANE_PID"
printf 'pane stdin -> '
readlink "/proc/$PANE_PID/fd/0"
printf 'pane stdout -> '
readlink "/proc/$PANE_PID/fd/1"

echo
echo "## 5. add a window and split it into two panes"
T new-window -t demo -n edit -c "$WORK" 'bash --norc'
T split-window -h -t demo:1 -c "$WORK" 'bash --norc'
T list-windows -t demo -F 'window=#{window_index} name=#{window_name} panes=#{window_panes} active=#{window_active}'
T list-panes -t demo:1 -F 'pane=#{pane_index} pid=#{pane_pid} tty=#{pane_tty} width=#{pane_width} height=#{pane_height} active=#{pane_active}'

echo
echo "## 6. type into a pane and capture its screen"
T send-keys -t demo:1.0 'echo PANE-A; tty' Enter
sleep 0.4
T capture-pane -p -t demo:1.0

echo
echo "## 7. default prefix and selected prefix bindings"
T show-options -g prefix
T list-keys -T prefix | grep -E 'C-b (c|d|%|"|\[|n|p|0|1) ' || true

echo
echo "## 8. detach a real attached client; session and its process survive"
script -qec "tmux -L $SOCK -f /dev/null attach -t demo" /dev/null >"$WORK/attach.log" 2>&1 &
CLIENT_WRAPPER=$!
sleep 1
T list-clients -F 'client=#{client_tty} session=#{client_session} pid=#{client_pid}'
T send-keys -t demo:0.0 'i=0; while :; do i=$((i+1)); echo "$i" > /tmp/ft-tmux-lab/counter; sleep 0.2; done' Enter
sleep 0.8
BEFORE=$(cat "$WORK/counter" 2>/dev/null || echo missing)
T detach-client -s demo
wait "$CLIENT_WRAPPER" 2>/dev/null || true
sleep 0.8
AFTER=$(cat "$WORK/counter" 2>/dev/null || echo missing)
echo "counter_before_detach=$BEFORE counter_after_detach=$AFTER"
echo "clients_now=$(T list-clients | wc -l)"
T list-sessions -F 'session=#{session_name} windows=#{session_windows} attached=#{session_attached}'

echo
echo "## 9. reattach a new client, then detach again"
script -qec "tmux -L $SOCK -f /dev/null attach -t demo" /dev/null >"$WORK/attach2.log" 2>&1 &
CLIENT_WRAPPER2=$!
sleep 1
T list-clients -F 'client=#{client_tty} session=#{client_session} pid=#{client_pid}'
T detach-client -s demo
wait "$CLIENT_WRAPPER2" 2>/dev/null || true

echo
echo "## 10. kill the server: sessions and pane processes end"
T kill-server
sleep 0.4
T list-sessions 2>&1 || true
printf 'server_alive_after_kill='
if kill -0 "$SERVER_PID" 2>/dev/null; then echo yes; else echo no; fi
printf 'pane_alive_after_kill='
if kill -0 "$PANE_PID" 2>/dev/null; then echo yes; else echo no; fi
