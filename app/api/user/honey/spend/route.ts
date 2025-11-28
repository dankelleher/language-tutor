import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * Spends honey from the user's balance.
 * Returns the new balance or an error if insufficient funds.
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const amount = body.amount ?? 1;

  if (amount < 1) {
    return Response.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { honey: true },
  });

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.honey < amount) {
    return Response.json({ error: 'Insufficient honey', honey: user.honey }, { status: 402 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { honey: { decrement: amount } },
    select: { honey: true },
  });

  return Response.json({ honey: updated.honey });
}
