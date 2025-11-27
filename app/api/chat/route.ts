import { streamObject, type ModelMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getSystemPrompt } from '@/lib/prompts';
import { tutorResponseSchema, type Language } from '@/lib/types';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, language = 'German' } = await req.json();

    const modelMessages: ModelMessage[] = [
      { role: 'system', content: getSystemPrompt(language as Language) },
      ...messages,
    ];

    const result = streamObject({
      model: anthropic('claude-sonnet-4-5-20250929'),
      messages: modelMessages,
      schema: tutorResponseSchema,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request', details: String(error) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
