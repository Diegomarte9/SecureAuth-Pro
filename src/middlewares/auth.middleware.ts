// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { PrismaClient } from '@prisma/client';
import { auditLog } from '../shared/auditLogger';

const prisma = new PrismaClient();

/**
 * Verifica JWT en Authorization header y adjunta usuario al req.user
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        auditLog('unauthorized_access', { reason: 'missing_token', ip: req.ip, path: req.path }, undefined);
        return res.status(401).json({ error: 'Token faltante o inválido' });
      }
      const token = authHeader.replace('Bearer ', '');
      const payload = jwt.verify(token, config.jwtAccessSecret) as { sub: string };

      // Obtener usuario para asegurar que existe y está activo
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.is_active) {
        auditLog('unauthorized_access', { reason: 'user_not_found_or_inactive', userId: payload.sub, ip: req.ip, path: req.path }, payload.sub);
        return res.status(401).json({ error: 'Usuario no autorizado' });
      }

      // Inyectar datos en la petición
      (req as any).user = { 
        sub: user.id, 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        is_active: user.is_active 
      };
      next();
    } catch (err: any) {
      auditLog('unauthorized_access', { reason: 'invalid_token', ip: req.ip, path: req.path }, undefined);
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  })();
}
