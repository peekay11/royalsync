import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db, saveDb } from '../../db';
import type { AuthRequest } from '../../types/auth';

export class ClaimController extends BaseController {
  public getClaims = (req: AuthRequest, res: Response) => {
    const claims = req.user?.role === 'CLIENT'
      ? db.claims.filter(claim => claim.client_id === req.user?.clientId)
      : db.claims;
    return this.sendSuccess(res, claims, 'Claims retrieved');
  };

  public createClaim = (req: AuthRequest, res: Response) => {
    if (!req.user?.clientId) return this.sendError(res, 'A client account is required', 403);
    const { type, amount, description } = req.body as Record<string, string | undefined>;
    if (!type || !description) return this.sendError(res, 'Claim type and description are required');
    const parsedAmount = amount ? Number(amount) : 0;
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) return this.sendError(res, 'Claim amount must be a positive number');
    const claim = { id: `clm_${Date.now()}`, reference: `CLM-${Date.now()}`, client_id: req.user.clientId, incidentDate: new Date().toISOString().slice(0, 10), status: 'submitted', amount: parsedAmount, type, description };
    db.claims.unshift(claim);
    saveDb();
    return this.sendSuccess(res, claim, 'Claim submitted', 201);
  };
}
