import type { INodeProperties } from 'n8n-workflow';

export const conversionOperations: INodeProperties[] = [
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
];

export const conversionFields: INodeProperties[] = [
	// pdfToZpl fields
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['pdfToZpl'],
			},
		},
		description: 'Name of the binary property containing the PDF file to convert',
	},
	{
		displayName: 'Target DPI',
		name: 'dpi',
		type: 'options',
		options: [
			{ name: '203 DPI (Standard)', value: 203 },
			{ name: '300 DPI (High Density)', value: 300 },
		],
		default: 203,
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['pdfToZpl'],
			},
		},
		description: 'Print head resolution for the target Zebra printer',
	},
	{
		displayName: 'Allow Budget Degradation',
		name: 'allowDegrade',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['pdfToZpl'],
			},
		},
		description: 'Whether to allow automatic resolution degradation if the PDF exceeds the token budget',
	},
	// zplToPdf fields
	{
		displayName: 'ZPL Source',
		name: 'zplSource',
		type: 'options',
		options: [
			{ name: 'Text / Expression', value: 'text' },
			{ name: 'Binary Property', value: 'binary' },
		],
		default: 'text',
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['zplToPdf'],
			},
		},
		description: 'Whether the ZPL input is provided as text or from a binary property',
	},
	{
		displayName: 'ZPL Content',
		name: 'zplContent',
		type: 'string',
		typeOptions: {
			rows: 5,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['zplToPdf'],
				zplSource: ['text'],
			},
		},
		description: 'Raw ZPL string to convert to PDF',
	},
	{
		displayName: 'Binary Property',
		name: 'zplBinaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['zplToPdf'],
				zplSource: ['binary'],
			},
		},
		description: 'Name of the binary property containing the ZPL file to convert',
	},
	{
		displayName: 'Output Binary Property',
		name: 'outputBinaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['zplToPdf'],
			},
		},
		description: 'Name of the binary property to store the generated PDF',
	},
];
