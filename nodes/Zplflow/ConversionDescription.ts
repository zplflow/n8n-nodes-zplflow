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
			// Datamax DPL
			{
				name: 'DPL to PDF',
				value: 'dplToPdf',
				description: 'Convert Datamax DPL label to PDF document',
				action: 'Convert DPL to PDF',
			},
			{
				name: 'DPL to ZPL',
				value: 'dplToZpl',
				description: 'Convert Datamax DPL label to Zebra ZPL code',
				action: 'Convert DPL to ZPL',
			},
			// Eltron EPL2
			{
				name: 'EPL to PDF',
				value: 'eplToPdf',
				description: 'Convert Eltron EPL2 label to PDF document',
				action: 'Convert EPL to PDF',
			},
			{
				name: 'EPL to ZPL',
				value: 'eplToZpl',
				description: 'Convert Eltron EPL2 label to Zebra ZPL code',
				action: 'Convert EPL to ZPL',
			},
			// Intermec IPL
			{
				name: 'IPL to PDF',
				value: 'iplToPdf',
				description: 'Convert Intermec IPL label to PDF document',
				action: 'Convert IPL to PDF',
			},
			{
				name: 'IPL to ZPL',
				value: 'iplToZpl',
				description: 'Convert Intermec IPL label to Zebra ZPL code',
				action: 'Convert IPL to ZPL',
			},
			// PDF
			{
				name: 'PDF to ZPL',
				value: 'pdfToZpl',
				description: 'Convert PDF document to Zebra ZPL code',
				action: 'Convert PDF to ZPL',
			},
			// SATO SBPL
			{
				name: 'SBPL to PDF',
				value: 'sbplToPdf',
				description: 'Convert SATO SBPL label to PDF document',
				action: 'Convert SBPL to PDF',
			},
			{
				name: 'SBPL to ZPL',
				value: 'sbplToZpl',
				description: 'Convert SATO SBPL label to Zebra ZPL code',
				action: 'Convert SBPL to ZPL',
			},
			// TSC TSPL
			{
				name: 'TSPL to PDF',
				value: 'tsplToPdf',
				description: 'Convert TSC TSPL label to PDF document',
				action: 'Convert TSPL to PDF',
			},
			{
				name: 'TSPL to ZPL',
				value: 'tsplToZpl',
				description: 'Convert TSC TSPL label to Zebra ZPL code',
				action: 'Convert TSPL to ZPL',
			},
			// ZPL
			{
				name: 'ZPL to DPL',
				value: 'zplToDpl',
				description: 'Transpile Zebra ZPL to Datamax DPL code',
				action: 'Convert ZPL to DPL',
			},
			{
				name: 'ZPL to EPL',
				value: 'zplToEpl',
				description: 'Transpile Zebra ZPL to Eltron EPL2 code',
				action: 'Convert ZPL to EPL',
			},
			{
				name: 'ZPL to IPL',
				value: 'zplToIpl',
				description: 'Transpile Zebra ZPL to Intermec IPL code',
				action: 'Convert ZPL to IPL',
			},
			{
				name: 'ZPL to PDF',
				value: 'zplToPdf',
				description: 'Convert Zebra ZPL code to PDF document',
				action: 'Convert ZPL to PDF',
			},
			{
				name: 'ZPL to SBPL',
				value: 'zplToSbpl',
				description: 'Transpile Zebra ZPL to SATO SBPL code',
				action: 'Convert ZPL to SBPL',
			},
			{
				name: 'ZPL to TSPL',
				value: 'zplToTspl',
				description: 'Transpile Zebra ZPL to TSC TSPL code',
				action: 'Convert ZPL to TSPL',
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
	// Generic input source (text vs binary) for non-PDF operations
	{
		displayName: 'Input Source',
		name: 'inputSource',
		type: 'options',
		options: [
			{ name: 'Text / Expression', value: 'text' },
			{ name: 'Binary Property', value: 'binary' },
		],
		default: 'text',
		displayOptions: {
			show: {
				resource: ['conversion'],
			},
			hide: {
				operation: ['pdfToZpl'],
			},
		},
		description: 'Whether the label input is provided as text or from a binary property',
	},
	{
		displayName: 'Label Content',
		name: 'textContent',
		type: 'string',
		typeOptions: {
			rows: 5,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
				inputSource: ['text'],
			},
			hide: {
				operation: ['pdfToZpl'],
			},
		},
		description: 'Raw label code (ZPL, EPL, DPL, IPL, TSPL, SBPL) to convert',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
				inputSource: ['binary'],
			},
			hide: {
				operation: ['pdfToZpl'],
			},
		},
		description: 'Name of the binary property containing the label data',
	},
	// Output binary property for PDF and dialect conversion results
	{
		displayName: 'Output Binary Property',
		name: 'outputBinaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversion'],
			},
			hide: {
				operation: ['pdfToZpl'],
			},
		},
		description: 'Name of the binary property to store the generated document',
	},
	// DPMM resolution for PDF generation
	{
		displayName: 'Resolution (DPMM)',
		name: 'dpmm',
		type: 'options',
		options: [
			{ name: '8 DPMM (203 DPI)', value: '8dpmm' },
			{ name: '12 DPMM (300 DPI)', value: '12dpmm' },
		],
		default: '8dpmm',
		displayOptions: {
			show: {
				resource: ['conversion'],
				operation: ['zplToPdf', 'eplToPdf', 'dplToPdf', 'iplToPdf', 'tsplToPdf', 'sbplToPdf'],
			},
		},
		description: 'Dot density used when rendering label to PDF',
	},
];
