import { streamObject, type ModelMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getSystemPrompt } from '@/lib/prompts';
import { tutorResponseSchema, type Language } from '@/lib/types';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { messages, language = 'German', sessionId, userAge, userNativeLanguage } = await req.json();

    // Get the latest user message (should be the last one)
    const latestUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();

    // Save user message to database if authenticated
    let chatSessionId = sessionId;
    if (userId && latestUserMessage) {
      // Create a new chat session if we don't have one
      if (!chatSessionId) {
        // Update user profile with age and native language if provided
        if (userAge !== undefined && userNativeLanguage !== undefined) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              age: userAge,
              nativeLanguage: userNativeLanguage,
            },
          });
        }

        const chatSession = await prisma.chatSession.create({
          data: {
            userId,
            language,
          },
        });
        chatSessionId = chatSession.id;
      }

      // Save the user message
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSessionId,
          role: 'user',
          content: latestUserMessage.content,
        },
      });

      // Increment answer counter and award honey if threshold reached
      const user = await prisma.user.update({
        where: { id: userId },
        data: { answersSinceLastHoney: { increment: 1 } },
        select: { answersSinceLastHoney: true },
      });

      if (user.answersSinceLastHoney >= 5) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            honey: { increment: 1 },
            answersSinceLastHoney: 0,
          },
        });
      }
    }

    // Fetch user profile for system prompt context
    let userProfile: { age: number | null; nativeLanguage: string | null } | null = null;
    if (userId) {
      userProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: { age: true, nativeLanguage: true },
      });
    }

    const modelMessages: ModelMessage[] = [
      {
        role: 'system',
        content: getSystemPrompt(
          language as Language,
          userProfile?.age ?? undefined,
          userProfile?.nativeLanguage ?? undefined
        ),
      },
      ...messages,
    ];

    const result = streamObject({
      model: anthropic('claude-sonnet-4-5-20250929'),
      messages: modelMessages,
      schema: tutorResponseSchema,
      onFinish: async ({ object }) => {
        // Save assistant response to database if authenticated
        if (userId && chatSessionId && object) {
          await prisma.chatMessage.create({
            data: {
              sessionId: chatSessionId,
              role: 'assistant',
              content: JSON.stringify(object),
            },
          });

          // Update session level if provided
          if (object.progress?.overallLevel) {
            await prisma.chatSession.update({
              where: { id: chatSessionId },
              data: {
                level: {
                  overallLevel: object.progress.overallLevel,
                  categoryLevels: object.progress.categoryLevels,
                },
              },
            });
          }
        }
      },
    });

    // Include sessionId in response headers so frontend can track it
    const response = result.toTextStreamResponse();
    if (chatSessionId) {
      response.headers.set('X-Chat-Session-Id', chatSessionId);
    }
    return response;
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
