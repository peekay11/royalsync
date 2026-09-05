import type { NextFunction, Request, Response } from 'express';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'ADVISER' | 'CLIENT' | 'PARTNER';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  clientId?: string;
}

export type AuthRequest = Request & { user?: AuthUser };

export type Middleware = (req: AuthRequest, res: Response, next: NextFunction) => void;