import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class Zplflow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zplflow',
		name: 'zplflow',
		icon: 'file:zplflow.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Universal Thermal Label Bridge for bi-directional ZPL ↔ PDF conversion & pipelines',
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['conversion'],
					},
				},
				options: [
					{
						name: 'PDF to ZPL',
						value: 'pdfToZpl',
						description: 'Convert PDF document to Zebra ZPL code',
						action: 'Convert PDF to ZPL',
					},
					{
						name: 'ZPL to PDF',
						value: 'zplToPdf',
						description: 'Convert Zebra ZPL code to PDF document',
						action: 'Convert ZPL to PDF',
					},
				],
				default: 'pdfToZpl',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Get Balance',
						value: 'getBalance',
						description: 'Retrieve current token balance and plan limits',
						action: 'Get account balance',
					},
				],
				default: 'getBalance',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		return [items];
	}
}
