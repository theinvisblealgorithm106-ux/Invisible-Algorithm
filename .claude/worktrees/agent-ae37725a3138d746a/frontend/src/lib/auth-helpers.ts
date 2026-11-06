import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export function signAccessToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(payload: object): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export function requireAdmin(req: Request): { userId: string; role: string } {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    throw NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
  }
  if (payload.role !== 'admin' && payload.role !== 'super_admin') {
    throw NextResponse.json({ success: false, message: 'Forbidden: admin access required' }, { status: 403 });
  }
  return { userId: payload.userId as string, role: payload.role as string };
}
