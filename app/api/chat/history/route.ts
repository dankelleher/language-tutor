import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json({ session: null, messages: [] });
    }

    // Get the user's most recent chat session with messages
    const chatSession = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chatSession) {
      return Response.json({ session: null, messages: [] });
    }

    return Response.json({
      session: {
        id: chatSession.id,
        language: chatSession.language,
        level: chatSession.level,
      },
      messages: chatSession.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.role === 'assistant' ? JSON.parse(msg.content) : msg.content,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error('Chat history API error:', error);
    return Response.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
