import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { bad, ok, serverError, unauthorized } from '@/lib/http';
import { searchWeb } from '@/lib/web-search';

export async function POST(req: NextRequest) {
	try {
		const me = await getCurrentUser();
		if (!me) return unauthorized();

		const { prompt } = await req.json();
		const query = String(prompt || '').trim();
		if (!query) return bad('Ask a question.');

		const key = process.env.OPENAI_API_KEY;
		if (key) {
			const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
			const response = await fetch('https://api.openai.com/v1/responses', {
				method: 'POST',
				headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ model, input: query }),
			});
			const data = await response.json();
			if (response.ok) return ok({ answer: data.output_text || 'No response returned.' });
		}

		const results = await searchWeb(query);
		if (results.length) {
			return ok({
				answer: `Web results for “${query}”:\n\n${results.slice(0, 5).map((result) => `• ${result.title}: ${result.url}`).join('\n')}`,
				source: 'web',
			});
		}

		return ok({ answer: 'Qevli AI is ready, but no AI provider is configured yet. Add OPENAI_API_KEY to enable full conversational answers.' });
	} catch {
		return serverError();
	}
}
