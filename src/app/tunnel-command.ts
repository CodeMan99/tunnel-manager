import * as net from 'node:net';
import {text} from 'node:stream/consumers';
import type {AppConfiguration} from './config.js';

export type TunnelDestination = {
	remoteHost: string;
};

export type TunnelSpecifier = {
	localPort: number;
	tunnelHost: string;
	tunnelPort: number;
};

export type TunnelCommand =
	| {cmd: 'start'; tunnel: TunnelSpecifier}
	| {cmd: 'status'}
	| {cmd: 'stop'};

export async function sendCommand(config: AppConfiguration, command: TunnelCommand, {remoteHost}: TunnelDestination): Promise<string> {
	const socket = net.connect(config.paths.server, () => {
		socket.write(command.cmd + '\n');
		socket.write(remoteHost + '\n');

		if (command.cmd === 'start') {
			const {tunnel} = command;
			socket.write(`${tunnel.localPort}:${tunnel.tunnelHost}:${tunnel.tunnelPort}\n`);
		}

		socket.end();
	});

	return text(socket);
}
