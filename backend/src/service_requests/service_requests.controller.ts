import type { Context } from 'hono';
import { prisma } from '../common/prisma';
import type { AppEnv } from '../common/types';

export async function createAddressChange(c: Context<AppEnv>) {
  const { newAddress, reason, clientId } = await c.req.json();
  const user = c.get('user');

  const reqRecord = await prisma.serviceRequest.create({
    data: {
      tenantId: user.tenantId,
      clientId,
      type: 'ADDRESS_CHANGE',
      status: 'SUBMITTED',
      payload: JSON.stringify({ newAddress, reason })
    }
  });

  return c.json({ serviceRequest: reqRecord });
}

export async function reviewRequest(c: Context<AppEnv>) {
  const id = c.req.param('id');
  const { action } = await c.req.json(); // 'APPROVE' or 'REJECT'
  const user = c.get('user');

  const sReq = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!sReq) return c.json({ error: 'Not found' }, 404);

  if (action === 'REJECT') {
    await prisma.serviceRequest.update({ where: { id }, data: { status: 'REJECTED' } });
    return c.json({ success: true, status: 'REJECTED' });
  }

  if (action === 'APPROVE') {
    const payload = JSON.parse(sReq.payload);
    const oldAddress = await prisma.address.findFirst({
      where: { clientId: sReq.clientId, isCurrent: true }
    });

    if (oldAddress) {
      await prisma.address.update({
        where: { id: oldAddress.id },
        data: { effectiveTo: new Date(), isCurrent: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        clientId: sReq.clientId,
        line1: payload.newAddress,
        isCurrent: true
      }
    });

    await prisma.serviceRequest.update({ where: { id }, data: { status: 'COMPLETED' } });

    await prisma.auditEvent.create({
      data: {
        actor: user.userId,
        tenantId: user.tenantId,
        action: 'APPROVE_ADDRESS_CHANGE',
        resource: 'Address',
        beforeState: JSON.stringify(oldAddress),
        afterState: JSON.stringify(newAddress)
      }
    });

    return c.json({ success: true, status: 'COMPLETED' });
  }

  return c.json({ error: 'Invalid action' }, 400);
}
