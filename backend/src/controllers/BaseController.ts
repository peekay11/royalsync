import { Request, Response } from 'express';

export class BaseController {
  protected sendSuccess(res: Response, data: unknown, message: string = 'Success', code: number = 200) {
    return res.status(code).json({
      success: true,
      message,
      data
    });
  }

  protected sendError(res: Response, message: string, code: number = 400) {
    return res.status(code).json({
      success: false,
      error: message
    });
  }
}
