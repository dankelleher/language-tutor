import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Creates the AI model provider based on environment configuration.
 *
 * When USE_WINDFALL=true and WINDFALL_API_KEY is set, routes through the
 * Windfall inference gateway (OpenAI-compatible). Otherwise, uses Anthropic directly.
 */
export const getModel = () => {
  const useWindfall = process.env.USE_WINDFALL === 'true' && !!process.env.WINDFALL_API_KEY;

  if (useWindfall) {
    const windfall = createOpenAI({
      baseURL: process.env.WINDFALL_BASE_URL ?? 'https://windfall.ecofrontiers.xyz/v1',
      apiKey: process.env.WINDFALL_API_KEY!,
      headers: {
        'X-Routing-Mode': process.env.WINDFALL_ROUTING_MODE ?? 'greenest',
      },
    });

    // Use .chat() to force the classic /v1/chat/completions endpoint.
    const modelId = process.env.WINDFALL_MODEL ?? 'auto';
    return windfall.chat(modelId);
  }

  return anthropic('claude-sonnet-4-5-20250929');
};
