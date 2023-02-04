import * as http from 'node:http';
import * as bodyParser from 'body-parser';
import express from 'express';
import {config} from './config.js';
import {logger} from './logger.js';
import {router} from './router.js';

const app = express();
const server = http.createServer(app);
const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
	if (err && !res.headersSent) {
		res.status(500);
		res.setHeader('X-Error-Type', err?.name);
	}
};

app.use(bodyParser.json());
app.use(logger);
app.use('/', router);
app.use(errorHandler);

server.listen(config.get('port'), function (this: http.Server) {
	const address = this.address();

	console.dir({address});
});
