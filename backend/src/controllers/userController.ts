import { Request, Response } from 'express';
import { users } from '../models/User';

export const getUsers = (req: Request, res: Response) => {
  res.json(users);
};
