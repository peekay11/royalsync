import type { Request, Response } from 'express';

export const askAi = (_req: Request, res: Response) => {
  res.status(503).json({ success: false, error: 'AI provider not configured' });
};
