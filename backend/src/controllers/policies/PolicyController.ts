import { Response } from 'express';
import { BaseController } from '../BaseController';
import { db } from '../../db';
import type { AuthRequest } from '../../types/auth';

export class PolicyController extends BaseController {
  public getPolicies = (req: AuthRequest, res: Response) => {
    const policies = req.user?.role === 'CLIENT'
      ? db.policies.filter(policy => policy.client_id === req.user?.clientId)
      : db.policies;
    return this.sendSuccess(res, policies, 'Policies retrieved');
  };
}
