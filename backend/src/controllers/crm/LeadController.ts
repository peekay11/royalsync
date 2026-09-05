import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db } from '../../db';

export class LeadController extends BaseController {
  public getLeads = (req: Request, res: Response) => {
    setTimeout(() => {
      this.sendSuccess(res, db.leads, 'Leads retrieved');
    }, 800);
  };

  public updateLeadStatus = (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const lead = db.leads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      setTimeout(() => this.sendSuccess(res, lead, 'Lead updated'), 400);
    } else {
      this.sendError(res, 'Lead not found', 404);
    }
  };
}
