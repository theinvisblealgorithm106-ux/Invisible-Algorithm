import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  role: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signAccessToken = (payload: JwtPayload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signRefreshToken = (payload: JwtPayload) => jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export const getTokenFromRequest = (req: Request): string | null => {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
};

export const requireAdmin = (req: Request): JwtPayload => {
  const token = getTokenFromRequest(req);
  if (!token) throw NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const payload = verifyAccessToken(token);
  if (!payload) throw NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
  if (!['admin', 'super_admin'].includes(payload.role)) {
    throw NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }
  return payload;
};

export const requireAuth = (req: Request): JwtPayload => {
  const token = getTokenFromRequest(req);
  if (!token) throw NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const payload = verifyAccessToken(token);
  if (!payload) throw NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
  return payload;
};
