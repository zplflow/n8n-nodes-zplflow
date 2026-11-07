import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { conversionFields, conversionOperations } from './ConversionDescription';
import { pipelineFields, pipelineOperations } from './PipelineDescription';
import { accountFields, accountOperations } from './AccountDescription';
import { zplflowApiRequest } from './GenericFunctions';

/**
 * Minimal structural view of the Node.js `Buffer` used by this node. It is
 * resolved from `globalThis` so the module stays self-contained.
 */
interface ZplflowBuffer {
	toString(encoding?: string): string;
}

interface ZplflowBufferConstructor {
	alloc(size: number): ZplflowBuffer;
	from(data: string, encoding: string): ZplflowBuffer;
}

type BinaryPayload = Parameters<IExecuteFunctions['helpers']['prepareBinaryData']>[0];

const nodeBuffer = (globalThis as unknown as { Buffer: ZplflowBufferConstructor }).Buffer;

/**
 * Description of the response returned by the Universal Label Bridge
 * conversion endpoints. Every page carries the base64 encoded document under
 * an operation specific key (e.g. `pdf_base64`, `zpl_base64`, ...).
 */
interface LabelBridgePage {
	[key: string]: string | undefined;
}

interface LabelBridgeResponse {
	request_id?: string;
	tokens_charged?: number;
	pages?: LabelBridgePage[];
}

export class Zplflow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zplflow',
		name: 'zplflow',
		icon: 'file:zplflow.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Universal Thermal Label Bridge for bi-directional ZPL ↔ PDF conversion & pipelines',
		defaults: {
			name: 'Zplflow',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'zplflowApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Conversion',
						value: 'conversion',
					},
					{
						name: 'Pipeline',
						value: 'pipeline',
					},
					{
						name: 'Account',
						value: 'account',
					},
				],
				default: 'conversion',
			},
			...conversionOperations,
			...conversionFields,
			...pipelineOperations,
			...pipelineFields,
			...accountOperations,
			...accountFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'conversion') {
					if (operation === 'pdfToZpl') {
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const dpi = this.getNodeParameter('dpi', i) as number;
						const allowDegrade = this.getNodeParameter('allowDegrade', i) as boolean;

						this.helpers.assertBinaryData(i, binaryPropertyName);
						const pdfBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
						const pdfBase64 = pdfBuffer.toString('base64');

						const response = await zplflowApiRequest.call(this, 'POST', '/v1/convert/pdf-to-zpl', {
							pdf_base64: pdfBase64,
							dpi,
							allow_degrade: allowDegrade,
						});

						let zplText = '';
						if (response.pages && response.pages.length > 0) {
							zplText = response.pages
								.map((p: { zpl_base64: string }) =>
									nodeBuffer.from(p.zpl_base64, 'base64').toString('utf-8'),
								)
								.join('\n');
						}

						returnData.push({
							json: {
								request_id: response.request_id,
								tokens_charged: response.tokens_charged,
								over_budget_tokens: response.over_budget_tokens,
								page_count: response.pages ? response.pages.length : 0,
								zpl: zplText,
							},
							binary: items[i].binary,
						});
					} else {
						// Universal Label Bridge operations: text/plain raw body
						const inputSource = this.getNodeParameter('inputSource', i) as string;
						const outputBinaryProperty = this.getNodeParameter('outputBinaryProperty', i) as string;

						let rawText = '';
						if (inputSource === 'text') {
							rawText = this.getNodeParameter('textContent', i) as string;
						} else {
							const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
							this.helpers.assertBinaryData(i, binaryProperty);
							const buf = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
							rawText = buf.toString('utf-8');
						}

						// Map operation to endpoint and query
						const endpointMap: Record<string, { path: string; key: string; isPdf: boolean }> = {
							zplToPdf: { path: '/v1/convert/zpl-to-pdf', key: 'pdf_base64', isPdf: true },
							eplToZpl: { path: '/v1/convert/epl-to-zpl', key: 'zpl_base64', isPdf: false },
							eplToPdf: { path: '/v1/convert/epl-to-pdf', key: 'pdf_base64', isPdf: true },
							zplToEpl: { path: '/v1/convert/zpl-to-epl', key: 'epl_base64', isPdf: false },
							dplToZpl: { path: '/v1/convert/dpl-to-zpl', key: 'zpl_base64', isPdf: false },
							dplToPdf: { path: '/v1/convert/dpl-to-pdf', key: 'pdf_base64', isPdf: true },
							zplToDpl: { path: '/v1/convert/zpl-to-dpl', key: 'dpl_base64', isPdf: false },
							iplToZpl: { path: '/v1/convert/ipl-to-zpl', key: 'zpl_base64', isPdf: false },
							iplToPdf: { path: '/v1/convert/ipl-to-pdf', key: 'pdf_base64', isPdf: true },
							zplToIpl: { path: '/v1/convert/zpl-to-ipl', key: 'ipl_base64', isPdf: false },
							tsplToZpl: { path: '/v1/convert/tspl-to-zpl', key: 'zpl_base64', isPdf: false },
							tsplToPdf: { path: '/v1/convert/tspl-to-pdf', key: 'pdf_base64', isPdf: true },
							zplToTspl: { path: '/v1/convert/zpl-to-tspl', key: 'tspl_base64', isPdf: false },
							sbplToZpl: { path: '/v1/convert/sbpl-to-zpl', key: 'zpl_base64', isPdf: false },
							sbplToPdf: { path: '/v1/convert/sbpl-to-pdf', key: 'pdf_base64', isPdf: true },
							zplToSbpl: { path: '/v1/convert/zpl-to-sbpl', key: 'sbpl_base64', isPdf: false },
						};

						const config = endpointMap[operation];
						if (!config) {
							throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, {
								itemIndex: i,
							});
						}

						const query: Record<string, string> = {};
						if (config.isPdf) {
							query.dpmm = this.getNodeParameter('dpmm', i, '8dpmm') as string;
						}

						const response = await zplflowApiRequest.call(
							this,
							'POST',
							config.path,
							rawText,
							query,
							{
								contentType: 'text/plain',
								json: false,
							},
						);

						const parsedResponse: LabelBridgeResponse =
							typeof response === 'string' ? JSON.parse(response) : response;

						let outputBytes: ZplflowBuffer = nodeBuffer.alloc(0);
						let outputText = '';

						const pages = parsedResponse.pages;
						if (pages && pages.length > 0) {
							const base64Val = pages[0][config.key];
							if (base64Val) {
								outputBytes = nodeBuffer.from(base64Val, 'base64');
								if (!config.isPdf) {
									outputText = outputBytes.toString('utf-8');
								}
							}
						}

						const mimeType = config.isPdf ? 'application/pdf' : 'text/plain';
						const targetFormat = operation.split('To')[1];
						const fileName = config.isPdf
							? 'label.pdf'
							: `label.${(targetFormat ?? 'txt').toLowerCase()}`;

						const binaryData = await this.helpers.prepareBinaryData(
							outputBytes as unknown as BinaryPayload,
							fileName,
							mimeType,
						);

						returnData.push({
							json: {
								request_id: parsedResponse.request_id,
								tokens_charged: parsedResponse.tokens_charged,
								page_count: pages ? pages.length : 0,
								text: outputText || undefined,
							},
							binary: {
								...items[i].binary,
								[outputBinaryProperty]: binaryData,
							},
						});
					}
				} else if (resource === 'pipeline') {
					const zplSource = this.getNodeParameter('zplSource', i) as string;
					let rawZpl = '';
					if (zplSource === 'text') {
						rawZpl = this.getNodeParameter('zplContent', i) as string;
					} else {
						const zplBinaryProperty = this.getNodeParameter('zplBinaryProperty', i) as string;
						this.helpers.assertBinaryData(i, zplBinaryProperty);
						const zplBuffer = await this.helpers.getBinaryDataBuffer(i, zplBinaryProperty);
						rawZpl = zplBuffer.toString('utf-8');
					}

					const zplBase64 = nodeBuffer.from(rawZpl, 'utf-8').toString('base64');

					if (operation === 'apply') {
						const pipelineId = this.getNodeParameter('pipelineId', i) as string;
						const variablesData = this.getNodeParameter('variables', i, {}) as {
							variableValues?: Array<{ name: string; value: string }>;
						};

						const variablesMap: Record<string, string> = {};
						if (variablesData.variableValues) {
							for (const pair of variablesData.variableValues) {
								if (pair.name) {
									variablesMap[pair.name] = pair.value;
								}
							}
						}

						const response = await zplflowApiRequest.call(
							this,
							'POST',
							`/v1/pipelines/${pipelineId}/apply`,
							{
								documents: [
									{
										zpl_base64: zplBase64,
										variables: variablesMap,
									},
								],
							},
						);

						let transformedZpl = '';
						if (response.documents && response.documents.length > 0) {
							transformedZpl = nodeBuffer
								.from(response.documents[0].zpl_base64, 'base64')
								.toString('utf-8');
						}

						returnData.push({
							json: {
								tokens_charged: response.tokens_charged,
								over_budget_tokens: response.over_budget_tokens,
								pipeline_id: pipelineId,
								zpl: transformedZpl,
							},
							binary: items[i].binary,
						});
					} else if (operation === 'preview') {
						const outputBinaryProperty = this.getNodeParameter(
							'outputBinaryProperty',
							i,
							'preview',
						) as string;

						const response = await zplflowApiRequest.call(this, 'POST', '/v1/pipelines/preview', {
							zpl_base64: zplBase64,
						});

						let pngBuffer: ZplflowBuffer = nodeBuffer.alloc(0);
						if (response.png_base64) {
							pngBuffer = nodeBuffer.from(response.png_base64, 'base64');
						}

						const binaryData = await this.helpers.prepareBinaryData(
							pngBuffer as unknown as BinaryPayload,
							'preview.png',
							'image/png',
						);

						returnData.push({
							json: {
								zpl: response.zpl || rawZpl,
								dpi: response.dpi || 203,
							},
							binary: {
								...items[i].binary,
								[outputBinaryProperty]: binaryData,
							},
						});
					}
				} else if (resource === 'account') {
					if (operation === 'getBalance') {
						const response = await zplflowApiRequest.call(this, 'GET', '/v1/account/balance');
						returnData.push({
							json: response,
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
