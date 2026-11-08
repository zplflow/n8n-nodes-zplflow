import type { INodeProperties } from 'n8n-workflow';

export const pipelineOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
			},
		},
		options: [
			{
				name: 'Apply Pipeline',
				value: 'apply',
				description: 'Apply a transformation pipeline to ZPL label documents',
				action: 'Apply pipeline',
			},
			{
				name: 'Live Preview',
				value: 'preview',
				description: 'Synchronously generate a preview PNG of a pipeline execution (0 tokens)',
				action: 'Preview pipeline',
			},
		],
		default: 'apply',
	},
];

export const pipelineFields: INodeProperties[] = [
	// Pipeline ID
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['apply'],
			},
		},
		description: 'The unique ID of the pipeline template to execute (e.g. pip_shipping_std)',
	},
	// ZPL Source selector
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
				zplSource: ['text'],
			},
		},
		description: 'Raw ZPL string to process through the pipeline',
	},
	{
		displayName: 'Binary Property',
		name: 'zplBinaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				zplSource: ['binary'],
			},
		},
		description: 'Name of the binary property containing the ZPL file to process',
	},
	// Dynamic variables collection
	{
		displayName: 'Variables',
		name: 'variables',
		placeholder: 'Add Variable',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['apply'],
			},
		},
		description:
			'Key-value pairs to dynamically resolve {{variable_name}} placeholders in the pipeline',
		options: [
			{
				name: 'variableValues',
				displayName: 'Variable',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Variable placeholder name matching {{name}} in pipeline steps',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Runtime value to inject into the label',
					},
				],
			},
		],
	},
	// Output binary property for preview PNG
	{
		displayName: 'Output Binary Property',
		name: 'outputBinaryProperty',
		type: 'string',
		default: 'preview',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['preview'],
			},
		},
		description: 'Name of the binary property where the preview PNG will be stored',
	},
];
