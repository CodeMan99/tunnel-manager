import * as net from 'node:net';
import {text} from 'node:stream/consumers';
import type {AppConfiguration} from './config.js';

type TunnelCommand =
	| 'start'
	| 'status'
	| 'stop';

export type TunnelDestination = {
	remoteHost: string;
};

export type TunnelSpecifier = {
	localPort: number;
	tunnelHost: string;
	tunnelPort: number;
};

export async function sendCommand(config: AppConfiguration, command: TunnelCommand, {remoteHost}: TunnelDestination, specifier?: TunnelSpecifier): Promise<string> {
	const socket = net.connect(config.paths.server, () => {
		socket.write(command + '\n');
		socket.write(remoteHost + '\n');

		if (command === 'start' && specifier) {
			socket.write(`${specifier.localPort}:${specifier.tunnelHost}:${specifier.tunnelPort}\n`);
		} else {
			throw new Error('Command "start" requires a tunnel to be specified');
		}

		socket.end();
	});

	return text(socket);
}
