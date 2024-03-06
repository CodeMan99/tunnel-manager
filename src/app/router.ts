import * as fs from 'node:fs/promises';
import express, {type Request, type Response} from 'express';
import {config} from './config.js';
import {type TunnelDestination, type TunnelSpecifier, type TunnelCommand, sendCommand} from './tunnel-command.js';

type TunnelRoute = `/tunnels/:${keyof TunnelDestination}`;

// eslint-disable-next-line new-cap
const router = express.Router();
const appConfig = config.store;

function textOk(res: Response<string>) {
	return (text: string) => res.status(200).contentType('text/plain').end(text);
}

const listOpenTunnels = async () => {
	const directory = await fs.opendir(appConfig.paths.tunnels, {encoding: 'utf8'});
	const tunnels = [];

	for await (const entry of directory) {
		if (entry.isSocket() && !appConfig.paths.server.endsWith(entry.name)) {
			tunnels.push(entry.name);
		}
	}

	return tunnels;
};

router.get('/tunnels', (_req, res, next) => {
	listOpenTunnels().then(tunnels => res.status(200).json({tunnels}), next);
});

const tunnelRoute = router.route<TunnelRoute>('/tunnels/:remoteHost');

tunnelRoute.put((req: Request<TunnelDestination, string, TunnelSpecifier>, res, next) => {
	// TODO validate req.body, there's no runtime type safety.
	const command: TunnelCommand = {cmd: 'start', tunnel: req.body};

	req.log.info({command}, 'requesting to %s tunnel', command.cmd);
	sendCommand(appConfig, command, req.params).then(textOk(res), next);
});

tunnelRoute.get((req: Request<TunnelDestination, string>, res, next) => {
	const command: TunnelCommand = {cmd: 'status'};

	req.log.info({command}, 'requesting to %s tunnel', command.cmd);
	sendCommand(appConfig, command, req.params).then(textOk(res), next);
});

tunnelRoute.delete((req: Request<TunnelDestination, string>, res, next) => {
	const command: TunnelCommand = {cmd: 'stop'};

	req.log.info({command}, 'requesting to %s tunnel', command.cmd);
	sendCommand(appConfig, command, req.params).then(textOk(res), next);
});

export {router};
