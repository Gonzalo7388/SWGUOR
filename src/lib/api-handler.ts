import { withAuditContext } from '@/lib/prisma-audit';
import type { Prisma } from '@prisma/client';

type TxClient = Prisma.TransactionClient;

type AuditContext = {
    userId: bigint;
    tx: TxClient;
};

type AuditHandler = (req: Request, ctx: AuditContext) => Promise<Response>;
type SessionExtractor = (req: Request) => Promise<bigint | null>;

export function createAuditHandler(getUserId: SessionExtractor) {
    return function withAudit(handler: AuditHandler) {
        return async (req: Request): Promise<Response> => {
            const userId = await getUserId(req);

            if (!userId) {
                return Response.json({ error: 'No autorizado' }, { status: 401 });
            }

            return withAuditContext(userId, (tx) =>
                handler(req, { userId, tx })
            );
        };
    };
}