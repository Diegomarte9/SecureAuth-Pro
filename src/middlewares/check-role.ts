import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { auditLog } from '../shared/auditLogger';

const prisma = new PrismaClient();

export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.sub;

      if (!userId) {
        auditLog('unauthorized_access', {
          reason: 'no_user_id',
          path: req.path,
          ip: req.ip
        }, undefined);

        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user || !allowedRoles.includes(user.role)) {
        auditLog('unauthorized_access', {
          reason: 'insufficient_permissions',
          userId,
          requiredRoles: allowedRoles,
          userRole: user?.role,
          path: req.path,
          ip: req.ip
        }, userId);

        res.status(403).json({ message: 'Permisos insuficientes' });
        return;
      }

      (req as any).user.role = user.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
