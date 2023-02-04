import {homedir} from 'node:os';
import * as path from 'node:path';
import Conf from 'conf';
import type {Options as PinoOptions} from 'pino-http';
import type {SeqConfig} from 'pino-seq';
import * as yaml from 'js-yaml';

export type AppConfiguration = {
	port: number;
	paths: {
		server: string;
		tunnels: string;
	};
	pino: PinoOptions;
	seq: SeqConfig;
};

type PinoLevel = NonNullable<PinoOptions['useLevel']>;

const pinoUseLevelEnumValues: PinoLevel[] = [
	'debug',
	'error',
	'fatal',
	'info',
	'silent',
	'trace',
	'warn',
];

export const config = new Conf<AppConfiguration>({
	projectName: 'tunnel-manger',
	projectSuffix: '',
	projectVersion: '1.0.0',
	configFileMode: 0o640,
	fileExtension: 'yml',
	serialize: value => yaml.dump(value, {
		indent: 2,
		lineWidth: 119,
	}),
	deserialize: text => yaml.load(text, {
		filename: 'config.yml',
	}) as AppConfiguration,
	defaults: {
		port: 8008,
		paths: {
			server: path.join(homedir(), 'conenctions/server.sock'),
			tunnels: path.join(homedir(), 'conenctions/tunnels'),
		},
		pino: {
			name: 'tunnel-manager',
			useLevel: 'info',
		},
		seq: {
			serverUrl: 'http://seq:5342',
			apiKey: '',
		},
	},
	schema: {
		port: {
			type: 'number',
			description: 'Use this port number to listen for TCP connections',
			default: 8008,
		},
		paths: {
			type: 'object',
			description: 'Required paths to the tunnel manager',
			properties: {
				server: {
					type: 'string',
					description: 'Path to a UnixDomain socket to connect with the tunnel manager',
					default: path.join(homedir(), 'conenctions/server.sock'),
				},
				tunnels: {
					type: 'string',
					description: 'Path to a directory containing ssh ControlMaster sockets',
					default: path.join(homedir(), 'connections/tunnels'),
				},
			},
		},
		pino: {
			type: 'object',
			description: 'Setup the pinoHttp logging instance',
			properties: {
				name: {
					type: 'string',
					description: 'Specify the application name for logging',
					default: 'tunnel-manager',
				},
				useLevel: {
					enum: pinoUseLevelEnumValues,
					description: 'Select logging level',
					default: 'info',
				},
			},
		},
		seq: {
			type: 'object',
			description: 'Setup the datalust/seq logging instance',
			properties: {
				serverUrl: {
					type: 'string',
					description: 'Ingest URL',
					default: 'http://seq:5342',
				},
				apiKey: {
					type: 'string',
					description: 'API Key for this specific application',
					default: '',
				},
			},
		},
	},
});
