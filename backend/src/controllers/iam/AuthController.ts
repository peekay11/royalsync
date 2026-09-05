import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db, saveDb } from '../../db';
import { createToken, hashPassword, verifyPassword } from '../../middleware/auth';
import type { AuthUser } from '../../types/auth';

export class AuthController extends BaseController {
  public login = (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const user = db.users.find(item => item.email.toLowerCase() === email?.toLowerCase());
    if (!user || !password || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return this.sendError(res, 'Invalid email or password', 401);
    }
    const authUser: AuthUser = { id: user.id, email: user.email, role: user.role as AuthUser['role'], clientId: user.clientId };
    return this.sendSuccess(res, { token: createToken(authUser), user: authUser }, 'Login successful');
  };

  public loginById = (req: Request, res: Response) => {
    const { idNumber, code } = req.body as { idNumber?: string; code?: string };
    const user = db.users.find(item => item.idNumber === idNumber);
    if (!user || !code) return this.sendError(res, 'Invalid identity or verification code', 401);
    return this.sendError(res, 'Identity login is unavailable until an OTP provider is configured', 503);
  };

  public sendOtp = (req: Request, res: Response) => {
    const { idNumber } = req.body as { idNumber?: string };
    const user = db.users.find(item => item.idNumber === idNumber);
    if (!user) return this.sendError(res, 'Identity not found', 404);
    return this.sendError(res, 'OTP delivery is unavailable until an OTP provider is configured', 503);
  };

  public register = (req: Request, res: Response) => {
    const { email, password, firstName, lastName, mobile } = req.body as Record<string, string | undefined>;
    if (!email || !password || password.length < 12 || !firstName || !lastName || !mobile) return this.sendError(res, 'Email, 12-character password, name and mobile are required');
    if (db.users.some(item => item.email.toLowerCase() === email.toLowerCase())) return this.sendError(res, 'Email is already registered', 409);
    const clientId = `cli_${Date.now()}`;
    const user = { id: `usr_${Date.now()}`, email, role: 'CLIENT' as const, clientId, passwordHash: hashPassword(password), idNumber: undefined };
    db.users.unshift(user);
    db.clients.unshift({ id: clientId, firstName, lastName, mobile, kycStatus: 'pending', riskProfile: 'Unknown' });
    saveDb();
    const authUser: AuthUser = { id: user.id, email: user.email, role: user.role, clientId };
    return this.sendSuccess(res, { token: createToken(authUser), user: authUser }, 'Registration successful', 201);
  };

  public bootstrapAdmin = (req: Request, res: Response) => {
    const configuredToken = process.env.BOOTSTRAP_TOKEN;
    if (!configuredToken || req.header('x-bootstrap-token') !== configuredToken) {
      return this.sendError(res, 'Bootstrap authorization failed', 401);
    }
    if (db.users.length > 0) return this.sendError(res, 'Bootstrap is disabled after the first account exists', 409);
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password || password.length < 12) return this.sendError(res, 'Email and a 12-character password are required');
    const user = { id: `usr_${Date.now()}`, email: email.toLowerCase(), role: 'SUPER_ADMIN' as const, passwordHash: hashPassword(password) };
    db.users.push(user);
    saveDb();
    return this.sendSuccess(res, { id: user.id, email: user.email, role: user.role }, 'Initial administrator created', 201);
  };
}
