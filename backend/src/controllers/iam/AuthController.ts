import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class AuthController extends BaseController {
  public login = (req: Request, res: Response) => {
    // Mock login returning JSON
    const mockUser = {
      id: 'usr_123',
      email: 'client@example.com',
      role: 'CLIENT',
      token: 'jwt_mock_token_abc123'
    };
    this.sendSuccess(res, mockUser, 'Login successful');
  };
}
