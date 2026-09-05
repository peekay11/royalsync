import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class AiController extends BaseController {
  public askQuestion = (req: Request, res: Response) => {
    return this.sendError(res, 'AI provider is not configured', 503);
  };
}
