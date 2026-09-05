import crypto from 'node:crypto';
import type { Response } from 'express';
import { BaseController } from './BaseController';
import { db, saveDb } from '../db';
import type { AuthRequest } from '../types/auth';

type CollectionName = Exclude<keyof typeof db, 'users' | 'clients'>;

export class ResourceController extends BaseController {
  public list = (collection: CollectionName) => (req: AuthRequest, res: Response) => {
    const records = db[collection] as Array<Record<string, unknown>>;
    const scoped = req.user?.role === 'CLIENT'
      ? records.filter(record => record.client_id === req.user?.clientId || record.clientId === req.user?.clientId)
      : records;
    return this.sendSuccess(res, scoped, `${collection} retrieved`);
  };

  public create = (collection: CollectionName) => (req: AuthRequest, res: Response) => {
    const body = req.body as Record<string, unknown>;
    if (!body || Object.keys(body).length === 0) return this.sendError(res, 'Request body is required');
    if (req.user?.role === 'CLIENT' && body.client_id && body.client_id !== req.user.clientId) {
      return this.sendError(res, 'Cannot create a record for another client', 403);
    }
    const record = {
      id: `${collection}_${crypto.randomUUID()}`,
      ...body,
      ...(req.user?.role === 'CLIENT' && !body.client_id ? { client_id: req.user.clientId } : {}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    (db[collection] as Array<Record<string, unknown>>).unshift(record);
    saveDb();
    return this.sendSuccess(res, record, `${collection} created`, 201);
  };

  public update = (collection: CollectionName) => (req: AuthRequest, res: Response) => {
    const records = db[collection] as Array<Record<string, unknown>>;
    const record = records.find(item => item.id === req.params.id);
    if (!record) return this.sendError(res, 'Record not found', 404);
    if (req.user?.role === 'CLIENT' && record.client_id !== req.user.clientId) return this.sendError(res, 'Access denied', 403);
    const body = req.body as Record<string, unknown>;
    Object.assign(record, body, { id: record.id, updated_at: new Date().toISOString() });
    saveDb();
    return this.sendSuccess(res, record, `${collection} updated`);
  };
}