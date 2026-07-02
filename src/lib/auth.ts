import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { NextRequest } from 'next/server';

export function getTokenFromRequest(request: NextRequest | Request): string | undefined {
  let token: string | undefined;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token && 'cookies' in request) {
    const cookiesReq = request as NextRequest;
    token = cookiesReq.cookies.get('accessToken')?.value;
  }

  return token;
}

const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
const encodedKey = new TextEncoder().encode(secret);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  if (password == hashed) return true;
  return await bcrypt.compare(password, hashed);
}

export async function createAccessToken(userId: number): Promise<string> {
  return await new SignJWT({ userId, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(encodedKey);
}

export async function createRefreshToken(userId: number): Promise<string> {
  return await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export interface AppJWTPayload extends JWTPayload {
  userId: number;
  type: string;
  role?: string;
}

export async function verifyToken(token: string): Promise<AppJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as AppJWTPayload;
  } catch (error) {
    return null;
  }
}
