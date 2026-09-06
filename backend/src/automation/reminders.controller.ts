import type { Request, Response } from 'express';

export const getReminders = (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
};
