import { Request, Response, NextFunction } from 'express';
import { userDb } from './userStore';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication token is required. Please log in to access this resource.',
      path: req.originalUrl,
    });
  }

  try {
    const decoded = userDb.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.message === 'SESSION_EXPIRED') {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        code: 'SESSION_EXPIRED',
        message: 'Your session has expired. Please log in again.',
        path: req.originalUrl,
      });
    }

    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      code: 'INVALID_TOKEN',
      message: 'Invalid security authentication token.',
      path: req.originalUrl,
    });
  }
}

// Optional Auth (attaches user if token present, but does not block)
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    try {
      const decoded = userDb.verifyToken(token);
      req.user = decoded;
    } catch {
      // Ignore token decode errors for optional endpoints
    }
  }
  next();
}
