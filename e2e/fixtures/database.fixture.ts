import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * Database fixture for e2e tests.
 * Provides utilities for seeding and cleaning up test data.
 */
export class DatabaseFixture {
  /** Cleans up all test data */
  async cleanup(): Promise<void> {
    await prisma.chatMessage.deleteMany({});
    await prisma.chatSession.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } },
    });
  }

  /** Seeds a test user with optional honey balance */
  async seedTestUser(options?: {
    honey?: number;
    answersSinceLastHoney?: number;
    name?: string;
    email?: string;
  }): Promise<string> {
    const email = options?.email ?? 'dev@localhost';
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        honey: options?.honey ?? 3,
        answersSinceLastHoney: options?.answersSinceLastHoney ?? 0,
        name: options?.name ?? 'Dev User',
      },
      create: {
        id: 'dev-user',
        email,
        name: options?.name ?? 'Dev User',
        honey: options?.honey ?? 3,
        answersSinceLastHoney: options?.answersSinceLastHoney ?? 0,
      },
    });
    return user.id;
  }

  /** Creates a chat session with existing messages */
  async seedChatHistory(
    userId: string,
    language: string = 'German'
  ): Promise<string> {
    const session = await prisma.chatSession.create({
      data: {
        userId,
        language,
        level: {
          overallLevel: 'A1',
          categoryLevels: [
            { category: 'vocabulary', level: 'A1' },
            { category: 'grammar', level: 'A1' },
            { category: 'tenses', level: 'A1' },
            { category: 'conversation', level: 'A1' },
          ],
          stepsToNextLevel: 5,
        },
        messages: {
          create: [
            {
              role: 'user',
              content: "Hi, I'm Test User and I want to learn German!",
            },
            {
              role: 'assistant',
              content: JSON.stringify({
                chatMessage: "Welcome! Let's begin your German journey.",
                englishSentence: '',
                submittedSentence: '',
                correctedResponse: '',
                explanations: [],
                nextExercise: {
                  fullSentence: 'The cat is small.',
                  parts: [
                    {
                      text: 'The cat',
                      translation: 'Die Katze',
                      notes: 'Feminine noun',
                    },
                    { text: 'is', translation: 'ist', notes: 'Third person singular' },
                    { text: 'small', translation: 'klein', notes: 'Adjective' },
                  ],
                },
                progress: {
                  overallLevel: 'A1',
                  categoryLevels: [
                    { category: 'vocabulary', level: 'A1' },
                    { category: 'grammar', level: 'A1' },
                    { category: 'tenses', level: 'A1' },
                    { category: 'conversation', level: 'A1' },
                  ],
                  stepsToNextLevel: 5,
                },
              }),
            },
          ],
        },
      },
    });
    return session.id;
  }

  /** Gets current honey balance for a user */
  async getHoneyBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { honey: true },
    });
    return user?.honey ?? 0;
  }

  /** Disconnects from the database */
  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}
