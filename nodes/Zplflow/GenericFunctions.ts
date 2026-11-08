import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Payload accepted by the Zplflow API. Requests may carry arbitrary JSON
 * structures, objects, arrays, primitives or raw text/binary bodies, so the
 * payload stays loosely typed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ZplflowApiPayload = any;

/**
 * Response returned by the Zplflow API. The shape depends on the endpoint,
 * therefore callers receive the raw parsed JSON body.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ZplflowApiResponse = any;

/**
 * Extra request options that let a caller override the defaults applied by
 * {@link zplflowApiRequest}, e.g. to send raw text/binary bodies, custom
 * headers or to opt out of JSON serialisation.
 */
export interface IRequestCustomOptions {
	headers?: IDataObject;
	contentType?: string;
	json?: boolean;
}

/**
 * Minimal description of the Node.js `crypto` builtin. The package does not
 * ship `@types/node`, so the module is loaded lazily through `require` and
 * typed with the small surface that is actually used here.
 */
interface NodeCryptoModule {
	randomUUID?: () => string;
}

declare const require: (moduleId: string) => unknown;

let cachedCrypto: NodeCryptoModule | undefined;

function getCrypto(): NodeCryptoModule {
	if (cachedCrypto === undefined) {
		const globalCrypto = (globalThis as { crypto?: NodeCryptoModule }).crypto;
		if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
			cachedCrypto = globalCrypto;
		} else {
			try {
				cachedCrypto = require('crypto') as NodeCryptoModule;
			} catch {
				cachedCrypto = {};
			}
		}
	}
	return cachedCrypto;
}

/**
 * Generates a RFC 4122 v4 UUID used to fall back on the rare runtimes where
 * `crypto.randomUUID` is unavailable.
 */
function fallbackUuid(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
		const random = (Math.random() * 16) | 0;
		const value = char === 'x' ? random : (random & 0x3) | 0x8;
		return value.toString(16);
	});
}

/**
 * Creates a unique idempotency key so that retries of a request are never
 * processed (and billed) twice by the Zplflow API.
 */
export function generateIdempotencyKey(): string {
	const crypto = getCrypto();
	if (typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return fallbackUuid();
}

/**
 * Thin wrapper around `this.helpers.request` used by every Zplflow node
 * function. It resolves the credentials, normalises the base URL, attaches the
 * API key plus a freshly generated `Idempotency-Key` header and maps request
 * failures to a `NodeApiError`.
 */
export async function zplflowApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: ZplflowApiPayload = {},
	query: JsonObject = {},
	customOptions: IRequestCustomOptions = {},
): Promise<ZplflowApiResponse> {
	const credentials = await this.getCredentials('zplflowApi');
	const rawBaseUrl = (credentials.baseUrl as string) || 'https://api.zplflow.io';
	const baseUrl = rawBaseUrl.replace(/\/+$/, '');

	const headers: IDataObject = {
		Authorization: `Bearer ${credentials.apiKey as string}`,
		'X-API-Key': credentials.apiKey as string,
		'Idempotency-Key': generateIdempotencyKey(),
		Accept: 'application/json',
		...customOptions.headers,
	};

	if (customOptions.contentType) {
		headers['Content-Type'] = customOptions.contentType;
	} else if (!headers['Content-Type']) {
		headers['Content-Type'] = 'application/json';
	}

	const isJson =
		customOptions.json !== undefined
			? customOptions.json
			: headers['Content-Type'] === 'application/json';

	const options: IRequestOptions = {
		headers,
		method,
		uri: `${baseUrl}${endpoint}`,
		body,
		qs: query,
		json: isJson,
	};

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
