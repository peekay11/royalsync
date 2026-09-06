import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { createToken, hashPassword, verifyPassword } from '../../middleware/auth';
import type { AuthUser, Role } from '../../types/auth';

export class AuthController extends BaseController {
  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return this.sendError(res, 'Email and password are required');
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return this.sendError(res, 'Invalid email or password', 401);
    }
    if (user.status === 'deactivated') return this.sendError(res, 'Account has been deactivated', 403);
    const client = await prisma.client.findUnique({ where: { userId: user.id } });
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      clientId: client?.id
    };
    return this.sendSuccess(res, { token: createToken(authUser), user: authUser }, 'Login successful');
  };

  public loginById = async (req: Request, res: Response) => {
    return this.sendError(res, 'OTP login is unavailable until an SMS provider is configured', 503);
  };

  public sendOtp = async (req: Request, res: Response) => {
    return this.sendError(res, 'OTP delivery is unavailable until an SMS provider is configured', 503);
  };

  public register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, mobile, idNumber } = req.body as Record<string, string | undefined>;
    if (!email || !password || !firstName || !lastName || !mobile) {
      return this.sendError(res, 'Email, password, name and mobile are required');
    }
    if (password.length < 8) return this.sendError(res, 'Password must be at least 8 characters');
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return this.sendError(res, 'Email is already registered', 409);

    // Use first tenant or create a default one
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({ data: { name: 'Royal Square Financial', slug: 'royal-square' } });
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role: 'CLIENT',
        firstName,
        lastName,
        idNumber,
        tenantId: tenant.id
      }
    });
    const client = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        firstName,
        lastName,
        mobile,
        email: email.toLowerCase(),
        idNumber,
        kycStatus: 'pending',
        riskProfile: 'Unknown'
      }
    });

    const authUser: AuthUser = { id: user.id, email: user.email, role: 'CLIENT', clientId: client.id };
    return this.sendSuccess(res, { token: createToken(authUser), user: authUser }, 'Registration successful', 201);
  };

  public bootstrapAdmin = async (req: Request, res: Response) => {
    const configuredToken = process.env.BOOTSTRAP_TOKEN;
    if (!configuredToken || req.header('x-bootstrap-token') !== configuredToken) {
      return this.sendError(res, 'Bootstrap authorization failed', 401);
    }
    const count = await prisma.user.count();
    if (count > 0) return this.sendError(res, 'Bootstrap is disabled after the first account exists', 409);
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password || password.length < 8) return this.sendError(res, 'Email and password (min 8 chars) are required');
    const tenant = await prisma.tenant.create({ data: { name: 'Royal Square Financial', slug: 'royal-square' } });
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role: 'SUPER_ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
        tenantId: tenant.id
      }
    });
    return this.sendSuccess(res, { id: user.id, email: user.email, role: user.role }, 'Initial administrator created', 201);
  };
}
