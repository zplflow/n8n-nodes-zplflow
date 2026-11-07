import type {
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
 * structures (objects, arrays, primitives), so the payload stays loosely typed.
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
 * Thin wrapper around `this.helpers.request` used by every Zplflow node
 * function. It resolves the credentials, normalises the base URL and maps
 * request failures to a `NodeApiError`.
 */
export async function zplflowApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: ZplflowApiPayload = {},
	query: JsonObject = {},
): Promise<ZplflowApiResponse> {
	const credentials = await this.getCredentials('zplflowApi');
	const rawBaseUrl = (credentials.baseUrl as string) || 'https://api.zplflow.com';
	const baseUrl = rawBaseUrl.replace(/\/+$/, '');

	const options: IRequestOptions = {
		headers: {
			'X-API-Key': credentials.apiKey as string,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		method,
		uri: `${baseUrl}${endpoint}`,
		body,
		qs: query,
		json: true,
	};

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
