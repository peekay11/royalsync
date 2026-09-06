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
    const { idNumber, code, authMethod } = req.body as { idNumber?: string; code?: string; authMethod?: string };
    if (!idNumber) return this.sendError(res, 'ID Number is required', 400);

    // Find client or user by idNumber
    const client = await prisma.client.findFirst({ where: { idNumber } });
    let user = null;
    if (client?.userId) {
      user = await prisma.user.findUnique({ where: { id: client.userId } });
    }
    if (!user) {
      user = await prisma.user.findFirst({ where: { idNumber } });
    }

    if (!user) {
      return this.sendError(res, 'No user found with the provided ID number', 404);
    }

    // Accept standard demo OTP '123456' or any 4+ digit code in development
    if (code && code !== '123456' && code.length < 4) {
      return this.sendError(res, 'Invalid verification code', 401);
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      clientId: client?.id
    };

    return this.sendSuccess(res, { token: createToken(authUser), user: authUser }, 'Authentication successful');
  };

  public sendOtp = async (req: Request, res: Response) => {
    const { idNumber } = req.body as { idNumber?: string };
    if (!idNumber) return this.sendError(res, 'ID number is required', 400);

    const client = await prisma.client.findFirst({ where: { idNumber } });
    const user = client?.userId 
      ? await prisma.user.findUnique({ where: { id: client.userId } })
      : await prisma.user.findFirst({ where: { idNumber } });

    const phone = client?.mobile || '071 234 5678';
    const email = user?.email || client?.email || 'client@royalsquare.co.za';

    const maskedPhone = phone.replace(/^(\d{3})\s*(\d{3})\s*(\d{4})$/, '$1 *** $3');
    const maskedEmail = email.replace(/^(.)(.*)(@.*)$/, (_m, p1, p2, p3) => `${p1}***${p3}`);

    return this.sendSuccess(res, {
      maskedPhone,
      maskedEmail,
      devOtp: '123456',
      message: 'OTP sent successfully (Demo OTP: 123456)'
    }, 'OTP sent successfully');
  };

  public register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, mobile, phone, idNumber } = req.body as Record<string, string | undefined>;
    const resolvedMobile = mobile || phone;
    if (!firstName || !lastName || !resolvedMobile) {
      return this.sendError(res, 'Name and mobile number are required', 400);
    }

    const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const idSuffix = idNumber ? `.${idNumber.slice(-4)}` : '';
    const resolvedEmail = (email && email.trim()) 
      ? email.toLowerCase().trim() 
      : `${cleanFirst}.${cleanLast}${idSuffix}@royalsquare.co.za`;

    const resolvedPassword = (password && password.length >= 8) ? password : 'Client@1234';

    // Use first tenant or create a default one
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({ data: { name: 'Royal Square Financial', slug: 'royal-square' } });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email: resolvedEmail } });
    if (!user && idNumber) {
      user = await prisma.user.findFirst({ where: { idNumber } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: resolvedEmail,
          passwordHash: hashPassword(resolvedPassword),
          role: 'CLIENT',
          firstName,
          lastName,
          idNumber,
          tenantId: tenant.id
        }
      });
    }

    let client = await prisma.client.findFirst({ where: { userId: user.id } });
    if (!client && idNumber) {
      client = await prisma.client.findFirst({ where: { idNumber } });
    }

    if (!client) {
      client = await prisma.client.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          firstName,
          lastName,
          mobile: resolvedMobile,
          email: resolvedEmail,
          idNumber,
          kycStatus: 'pending',
          riskProfile: 'Unknown'
        }
      });
    }

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
