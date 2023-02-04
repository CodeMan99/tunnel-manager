import * as fs from 'node:fs/promises';
import express, {type Request, type Response} from 'express';
import {config} from './config.js';
import {type TunnelDestination, type TunnelSpecifier, sendCommand} from './tunnel-command.js';

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

router.put('/tunnels/:remoteName', (req: Request<TunnelDestination, string, TunnelSpecifier>, res, next) => {
	const command = 'start';

	req.log.info({command}, 'requesting to %s tunnel', command);
	sendCommand(appConfig, command, req.params, req.body).then(textOk(res), next);
});

router.get('/tunnels/:remoteName', (req: Request<TunnelDestination, string>, res, next) => {
	const command = 'status';

	req.log.info({command}, 'requesting to %s tunnel', command);
	sendCommand(appConfig, command, req.params).then(textOk(res), next);
});

router.delete('/tunnels/:remoteName', (req: Request<TunnelDestination, string>, res, next) => {
	const command = 'stop';

	req.log.info({command}, 'requesting to %s tunnel', command);
	sendCommand(appConfig, command, req.params).then(textOk(res), next);
});

export {router};
