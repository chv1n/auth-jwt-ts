import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

export default function middlewareAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.acccessToken;
  if (!token) return res.status(401).json({message: "No token"})
  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as unknown as { sub: number; iat: number; exp: number };
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
