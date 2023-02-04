#!/usr/bin/env bash
#
# A stupid netcat based server that communicates in plain text over a
# Unix-Domain socket.

declare PID=$$
declare response_path="response-${PID}.fifo"
declare socket_path="${SOCKET_PATH:-server.sock}"
declare tunnels_path="${TUNNELS_PATH:-tunnels}"

trap cleanup EXIT

function cleanup() {
	local remote_host
	shopt -s nullglob
	info "cleanup: safe shutdown requested"
	for tunnel_path in "$tunnels_path"/*.sock; do
		remote_host=$(basename -s .sock "$tunnel_path")
		info "cleaup: shutdown remote host -> %s" $remote_host
		ssh -S "$tunnel_path" -O exit $remote_host 2>&1
	done
	info "cleanup: removing %s & %s" "$response_path" "$socket_path"
	rm -f "$response_path" "$socket_path"
	info "cleanup: removing %s directory" "$tunnel_path"
	rmdir "$tunnels_path" || echo "Warning: tunnels may still exist"
}

function info() {
	local message="$1"; shift
	TZ=UTC printf "INFO %(%F %T %Z)T: $message\n" $(date +%s) "$@"
	## TODO log directly to Seq.
	# seqcli log -m "$message" -p ProcessID="$PID" -p name=socket_server
}

function init() {
	info "init: create %s" "$response_path"
	mkfifo "$response_path"
	info "init: create %s" "$tunnels_path"
	mkdir "$tunnels_path"
}

function listener() {
	read request && read remote_host;

	(
		case "$request" in
			start)
				if read tunnel_specifier; then
					info "listener: start -> %s on %s" "$tunnels_path" "$remote_host"
					# IMPORTANT! Do not send stderr to the server, it stays open in the backgroud
					ssh -o StrictHostKeyChecking=no \
						-o ExitOnForwardFailure=yes \
						-4 -f -N -M -S "$tunnels_path/${remote_host}.sock" \
						-L "$tunnel_specifier" \
						${remote_host}
				else
					(echo "Error: No tunnel specified"; exit 1)
				fi
				;;
			status)
				info "listener: status -> %s" "$remote_host"
				ssh -S "$tunnels_path/${remote_host}.sock" -O check ${remote_host} 2>&1
				;;
			stop)
				info "listener: stop -> %s" "$remote_host"
				ssh -S "$tunnels_path/${remote_host}.sock" -O exit ${remote_host} 2>&1
				;;
			*)
				(echo "Error: Unknown command. Available: start, status, stop"; exit 1)
				;;
		esac
		echo "exit: $?"
	) > "$response_path"
}

init

while true; do
	cat "$response_path" | nc -UvlN "$socket_path" | listener
done
