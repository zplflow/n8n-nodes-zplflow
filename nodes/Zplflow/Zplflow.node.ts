import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { conversionFields, conversionOperations } from './ConversionDescription';
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
						name: 'Account',
						value: 'account',
					},
				],
				default: 'conversion',
			},
			...conversionOperations,
			...conversionFields,
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

						const executionData: INodeExecutionData = {
							json: {
								request_id: response.request_id,
								tokens_charged: response.tokens_charged,
								over_budget_tokens: response.over_budget_tokens,
								page_count: response.pages ? response.pages.length : 0,
								zpl: zplText,
							},
							binary: items[i].binary,
						};

						returnData.push(executionData);
					} else if (operation === 'zplToPdf') {
						const zplSource = this.getNodeParameter('zplSource', i) as string;
						const outputBinaryProperty = this.getNodeParameter('outputBinaryProperty', i) as string;

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

						const response = await zplflowApiRequest.call(this, 'POST', '/v1/convert/zpl-to-pdf', {
							zpl_base64: zplBase64,
						});

						let pdfBuffer: ZplflowBuffer = nodeBuffer.alloc(0);
						if (response.pages && response.pages.length > 0) {
							pdfBuffer = nodeBuffer.from(response.pages[0].pdf_base64, 'base64');
						}

						const binaryData = await this.helpers.prepareBinaryData(
							pdfBuffer as unknown as BinaryPayload,
							'label.pdf',
							'application/pdf',
						);

						const executionData: INodeExecutionData = {
							json: {
								request_id: response.request_id,
								tokens_charged: response.tokens_charged,
								page_count: response.pages ? response.pages.length : 0,
							},
							binary: {
								...items[i].binary,
								[outputBinaryProperty]: binaryData,
							},
						};

						returnData.push(executionData);
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
