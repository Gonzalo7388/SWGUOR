import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type TxClient = Prisma.TransactionClient;

export async function withAuditContext<T>(
    userId: bigint | number,
    fn: (tx: TxClient) => Promise<T>
): Promise<T> {
    return prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(
            `SET LOCAL "app.current_user_id" = '${Number(userId)}'`
        );
        return fn(tx);
    });
}