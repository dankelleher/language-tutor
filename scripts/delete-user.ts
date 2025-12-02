import { prisma } from '../lib/prisma';

async function deleteUser(email: string) {
  console.log(`Deleting user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  // Delete the user (cascade will delete sessions, chat sessions, and messages)
  await prisma.user.delete({
    where: { email },
  });

  console.log('User deleted successfully');
}

deleteUser('danielbkelleher@gmail.com')
  .catch(console.error)
  .finally(() => prisma.$disconnect());
