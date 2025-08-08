import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/tokenService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    teamId: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = TokenService.verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
