import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class AiController extends BaseController {
  public askQuestion = (req: Request, res: Response) => {
    const mockResponse = {
      answer: 'Your net worth is R1,200,000.',
      citations: ['ClientFinancials']
    };
    this.sendSuccess(res, mockResponse, 'AI response generated');
  };
}
