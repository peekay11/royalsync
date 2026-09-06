import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class MessagingController extends BaseController {
  /** GET /api/messages — list all conversations (admin view) */
  public getConversations = async (req: AuthRequest, res: Response) => {
    const tenantId = await this.getTenantId(req.user?.id, req.user?.role);
    const conversations = await prisma.conversation.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { firstName: true, lastName: true, mobile: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });
    return this.sendSuccess(res, conversations.map(c => ({
      id: c.id,
      clientId: c.clientId,
      clientName: `${c.client.firstName} ${c.client.lastName}`,
      clientMobile: c.client.mobile,
      clientEmail: c.client.email,
      lastMessage: c.messages[0]?.content ?? '',
      lastMessageAt: c.messages[0]?.createdAt ?? c.createdAt,
      messageCount: c.messages.length,
      createdAt: c.createdAt
    })), 'Conversations retrieved');
  };

  /** GET /api/messages/:clientId — get or create conversation for client */
  public getOrCreateConversation = async (req: AuthRequest, res: Response) => {
    const clientId = req.params['clientId'] as string;
    const tenantId = await this.getTenantId(req.user?.id, req.user?.role);
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);

    let conv = await prisma.conversation.findFirst({
      where: { clientId, tenantId },
      include: {
        client: { select: { firstName: true, lastName: true, mobile: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: { tenantId, clientId },
        include: {
          client: { select: { firstName: true, lastName: true, mobile: true, email: true } },
          messages: { orderBy: { createdAt: 'asc' } }
        }
      });
    }

    return this.sendSuccess(res, conv, 'Conversation retrieved');
  };

  /** POST /api/messages/:clientId — send a message to a client */
  public sendMessage = async (req: AuthRequest, res: Response) => {
    const clientId = req.params['clientId'] as string;
    const { content } = req.body as { content?: string };
    if (!content?.trim()) return this.sendError(res, 'Message content is required');
    const tenantId = await this.getTenantId(req.user?.id, req.user?.role);
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);

    let conv = await prisma.conversation.findFirst({ where: { clientId, tenantId } });
    if (!conv) {
      conv = await prisma.conversation.create({ data: { tenantId, clientId } });
    }

    const message = await prisma.message.create({
      data: { conversationId: conv.id, role: 'adviser', content: content.trim() }
    });

    // Also create a notification for the client
    await prisma.notification.create({
      data: {
        tenantId,
        clientId,
        title: 'New message from your adviser',
        body: content.trim().slice(0, 120),
        channel: 'in_app',
        status: 'unread'
      }
    });

    await audit(req.user, 'SEND_MESSAGE', 'messages', message.id, `Message sent to client ${clientId}`);
    return this.sendSuccess(res, message, 'Message sent', 201);
  };

  private getTenantId = async (userId?: string, role?: string) => {
    if (role === 'SUPER_ADMIN') return (await prisma.tenant.findFirst())?.id ?? null;
    if (!userId) return null;
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return u?.tenantId ?? null;
  };
}
