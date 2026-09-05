import { Request, Response } from 'express';
import { prisma } from '../common/prisma';
import { FinancialSummaryService } from '../financials/financials.service';

const finService = new FinancialSummaryService();

export async function askAi(req: Request, res: Response) {
  let { conversationId, question } = req.body;
  const user = (req as any).user;

  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true }
    });
  }

  if (!conversation) {
    const client = await prisma.client.findUnique({ where: { userId: user.userId } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    conversation = await prisma.conversation.create({
      data: { tenantId: user.tenantId, clientId: client.id }
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: 'user', content: question }
  });

  // Pull context
  const clientData = await prisma.client.findUnique({
    where: { id: conversation.clientId },
    include: { assets: true, liabilities: true, incomes: true, expenses: true }
  });

  const summary = finService.calculateSummary(
    clientData!.assets, clientData!.liabilities, clientData!.incomes, clientData!.expenses
  );

  // Mock Anthropic / LLM logic
  // A real implementation would inject the summary into the prompt.
  const answer = `Based on your records, your net worth is R${summary.netWorth.toLocaleString()}. You have R${summary.totalAssets.toLocaleString()} in assets and R${summary.totalLiabilities.toLocaleString()} in liabilities. Your monthly surplus is R${summary.monthlySurplus.toLocaleString()}. Is there anything specific about these figures you'd like me to explain?`;

  const assistantMessage = await prisma.message.create({
    data: { conversationId: conversation.id, role: 'assistant', content: answer }
  });

  res.json({ conversationId: conversation.id, answer: assistantMessage.content });
}
