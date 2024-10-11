import type { ExecutionContext, Request } from '@cloudflare/workers-types/experimental';
import { fetchImageToTextResult, fetchSpeechToTextResult, fetchTextInterpretationResult, getRequestParam, readRequestBody } from './utils';
// @ts-ignore
import { Ai } from './vendor/@cloudflare/ai.js';

import { runWithTools } from '@cloudflare/ai-utils';


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		// const typeParam = getRequestParam(request, 'type');
		// if (request.method !== 'POST' || typeParam == null || !acceptedTypes.includes(typeParam)) {
		// 	return new Response(`Expected a POST request with a type parameter of "audio" | "image" | "text"`, { status: 400 });
		// }

		const ai = new Ai(env.AI);

		const sum = (args: { a: number; b: number }): Promise<string> => {
			const { a, b } = args;
			console.log('called');
			return Promise.resolve((a + b).toString());
		};

		const messages = [
			{
				role: 'system',
				content: `You are a broken calculator.
		
				You will listen to the user's conversation and execute the only function you have in tools

				if the function you have give another result say sorry i can't handle this operation

				`,
			},
			{
				role: 'user',
				content: 'What the result of 1 - 1 ?',
			},
		];

		// Run AI inference with function calling
		const response = await runWithTools(
			ai,
			// Model with function calling support
			'@hf/nousresearch/hermes-2-pro-mistral-7b',

			{
				// Messages
				messages,
				// Definition of available tools the AI model can leverage
				tools: [
					{
						name: 'sum',
						description: 'function take two values a and b',
						parameters: {
							type: 'object',
							properties: {
								a: { type: 'number', description: 'the first number' },
								b: { type: 'number', description: 'the second number' },
							},
							required: ['a', 'b'],
						},
						// reference to previously defined function
						function: sum,
					},
				],
			}
		);
		return new Response(JSON.stringify(response));
	},
};
