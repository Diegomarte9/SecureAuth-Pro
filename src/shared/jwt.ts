// src/shared/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

/**
 * Genera un JWT de acceso o refresh
 * @param payload - Datos a incluir en el token (p.ej. { sub: userId })
 * @param type - 'access' o 'refresh'
 */
export function signJwt(payload: JwtPayload, type: 'access' | 'refresh'): string {
  const secret = type === 'access' ? config.jwtAccessSecret : config.jwtRefreshSecret;
  const expiresIn = type === 'access' ? config.jwtAccessExpires : config.jwtRefreshExpires;
  return jwt.sign(payload, secret as string, { expiresIn } as any);
}

/**
 * Verifica un JWT y devuelve su payload
 * @param token - Token a verificar
 * @param type - 'access' o 'refresh'
 */
export function verifyJwt(token: string, type: 'access' | 'refresh'): JwtPayload {
  const secret = type === 'access' ? config.jwtAccessSecret : config.jwtRefreshSecret;
  return jwt.verify(token, secret) as JwtPayload;
}
