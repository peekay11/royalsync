import { Request, Response } from 'express';
import { prisma } from '../common/prisma';

export async function getAuditEvents(req: Request, res: Response) {
  const user = (req as any).user;
  const clientId = req.query.client_id; // optional filter

  // Real implementations would filter by resource that relates to the client
  const events = await prisma.auditEvent.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ events });
}
