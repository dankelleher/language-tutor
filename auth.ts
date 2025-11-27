import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: 'Language Tutor <onboarding@resend.dev>',
    }),
    // Dev-only credentials provider for testing
    ...(process.env.NODE_ENV === 'development'
      ? [
          Credentials({
            name: 'Dev Login',
            credentials: {
              email: { label: 'Email', type: 'email' },
            },
            authorize: async (credentials) => {
              if (credentials?.email === 'dev@localhost') {
                return {
                  id: 'dev-user',
                  email: 'dev@localhost',
                  name: 'Dev User',
                };
              }
              return null;
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
});
