import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../utils/validators';
import type { AuthRequest } from '../middleware/middlewareAuth';

function signAccessToken(userId: number) {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ sub: userId }, secret, { expiresIn: '15m' }); 
}

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.format() });
    }
    const { email, password, name } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    
    const token = signAccessToken(user.id);
    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: token
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.format() });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signAccessToken(user.id);

    res.cookie("acccessToken", token, {
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite: "strict",
      maxAge : 15*60*1000
    })

    return res.json({
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
