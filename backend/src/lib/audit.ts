import { prisma } from './prisma';
import type { AuthUser } from '../types/auth';

export const audit = async (
  actor: AuthUser | undefined,
  action: string,
  resource: string,
  resourceId?: string,
  description?: string
) => {
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: actor?.id,
        actorRole: actor?.role,
        tenantId: actor?.clientId ? undefined : undefined, // tenantId resolved per actor lookup if needed
        action,
        resource,
        resourceId,
        description
      }
    });
  } catch {
    // Audit writes must never crash the main request
  }
};
