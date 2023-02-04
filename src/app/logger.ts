import {pinoHttp, type GenReqId} from 'pino-http';
import * as seq from 'pino-seq';
import * as pino from 'pino';
import {v4 as uuid} from 'uuid';
import {config} from './config.js';

const stream = pino.multistream([
	pino.destination(),
	seq.createStream(config.get('seq')),
]);
const generateRequestId: GenReqId = (req, res) => {
	const headerName = 'X-Request-Id';
	const id = typeof req.id === 'string' ? req.id : undefined;
	const requestId = id ?? req.headers[headerName] ?? uuid();

	res.setHeader(headerName, requestId);

	return requestId.toString();
};

export const logger = pinoHttp({
	stream,
	name: 'tunnel-manager',
	genReqId: generateRequestId,
	...config.get('pino'),
});
