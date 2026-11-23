import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
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
 * Minimal structural view of the global Web Crypto API (`crypto.randomUUID`),
 * available natively in Node.js 19+ and n8n Cloud runtimes.
 */
interface CryptoLike {
	randomUUID?: () => string;
}

declare const crypto: CryptoLike | undefined;

/**
 * Generates a RFC 4122 v4 UUID used to fall back on runtimes where
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
	if (typeof crypto !== 'undefined' && typeof crypto?.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return fallbackUuid();
}

/**
 * Thin wrapper around `this.helpers.httpRequestWithAuthentication` used by
 * every Zplflow node function. It resolves the base URL from credentials,
 * attaches a freshly generated `Idempotency-Key` header, delegates auth
 * headers to the `zplflowApi` credential definition, and maps request
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

	const options: IHttpRequestOptions = {
		headers,
		method,
		url: `${baseUrl}${endpoint}`,
		body,
		qs: query,
		json: isJson,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'zplflowApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
