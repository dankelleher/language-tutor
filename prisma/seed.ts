import { prisma } from '../lib/prisma';

/**
 * Seeds the database with initial data for development.
 */
async function main() {
  // Create dev user that matches the dev credentials provider
  const devUser = await prisma.user.upsert({
    where: { id: 'dev-user' },
    update: {},
    create: {
      id: 'dev-user',
      email: 'dev@localhost',
      name: 'Dev User',
      age: 25,
      nativeLanguage: 'English',
      honey: 3,
    },
  });

  console.log('Seeded dev user:', devUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
