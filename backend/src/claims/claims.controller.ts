import type { Context } from 'hono';
import { prisma } from '../common/prisma';
import { MockProviderAdapter } from '../integrations/MockProviderAdapter';
import type { AppEnv } from '../common/types';

const adapter = new MockProviderAdapter();

export async function submitAccidentClaim(c: Context<AppEnv>) {
  const { policyId, incidentDate, description, photos, idempotencyKey } = await c.req.json();
  const user = c.get('user');

  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy) return c.json({ error: 'Policy not found' }, 404);

  // Idempotency check
  if (idempotencyKey) {
    const existingOp = await prisma.integrationOperation.findUnique({ where: { key: idempotencyKey } });
    if (existingOp) {
      return c.json({ claimNumber: JSON.parse(existingOp.result).claimNumber, fromCache: true });
    }
  }

  const claim = await prisma.claim.create({
    data: {
      tenantId: user.tenantId,
      clientId: policy.clientId,
      policyId,
      incidentDate: new Date(incidentDate),
      description,
      events: {
        create: { eventType: 'SUBMITTED' }
      }
    }
  });

  const response = await adapter.submitClaim(claim);

  await prisma.claim.update({
    where: { id: claim.id },
    data: { claimNumber: response.claimNumber }
  });

  if (idempotencyKey) {
    await prisma.integrationOperation.create({
      data: { key: idempotencyKey, result: JSON.stringify(response) }
    });
  }

  await prisma.auditEvent.create({
    data: {
      actor: user.userId,
      tenantId: user.tenantId,
      action: 'SUBMIT_CLAIM',
      resource: 'Claim',
      afterState: JSON.stringify({ ...claim, claimNumber: response.claimNumber })
    }
  });

  return c.json({ claim: { ...claim, claimNumber: response.claimNumber } });
}

export async function advanceClaim(c: Context<AppEnv>) {
  const id = c.req.param('id');
  const user = c.get('user');

  if (!id) {
    return c.json({ error: 'Claim ID is required' }, 400);
  }

  const claim = await prisma.claim.findUnique({ where: { id } });
  if (!claim) return c.json({ error: 'Not found' }, 404);

  const states = ['SUBMITTED', 'HANDLER_ASSIGNED', 'ASSESSED', 'REPAIR_AUTHORISED', 'REPAIR_SCHEDULED', 'COMPLETED'];
  const currentIndex = states.indexOf(claim.status);

  if (currentIndex === -1 || currentIndex === states.length - 1) {
    return c.json({ error: 'Cannot advance further' }, 400);
  }

  const nextStatus = states[currentIndex + 1];

  const updated = await prisma.claim.update({
    where: { id },
    data: { status: nextStatus }
  });

  await prisma.claimEvent.create({
    data: { claimId: id, eventType: nextStatus }
  });

  await prisma.auditEvent.create({
    data: { actor: user.userId, tenantId: user.tenantId, action: 'ADVANCE_CLAIM', resource: 'Claim', beforeState: JSON.stringify(claim), afterState: JSON.stringify(updated) }
  });

  return c.json({ claim: updated });
}

export async function getClaimTimeline(c: Context<AppEnv>) {
  const id = c.req.param('id');
  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { events: { orderBy: { createdAt: 'asc' } } }
  });
  if (!claim) return c.json({ error: 'Not found' }, 404);
  return c.json({ claim });
}
