// src/modules/users/services/users.service.ts
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { auditLog } from '../../../shared/auditLogger';

const prisma = new PrismaClient();

export class UsersService {
  /**
   * Verificar si un usuario puede editar/eliminar a otro usuario
   */
  async canModifyUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    });

    // Si no existe el usuario actual, no puede modificar
    if (!currentUser) {
      return false;
    }

    // Los admins pueden modificar cualquier usuario
    if (currentUser.role === 'ADMIN') {
      return true;
    }

    // Los usuarios normales solo pueden modificar su propia cuenta
    return currentUserId === targetUserId;
  }

  /**
   * Verificar si un usuario puede ver a otro usuario
   */
  async canViewUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    });

    // Si no existe el usuario actual, no puede ver
    if (!currentUser) {
      return false;
    }

    // Los admins pueden ver cualquier usuario
    if (currentUser.role === 'ADMIN') {
      return true;
    }

    // Los usuarios normales solo pueden ver su propia cuenta
    return currentUserId === targetUserId;
  }

  /**
   * Listar usuarios con paginación y búsqueda
   */
  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { page, limit, search } = options;
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw Object.assign(new Error('Usuario no encontrado'), {
        statusCode: 404,
      });
    }
    return user;
  }

  /**
   * Crear usuario (sin OTP)
   */
  async create(data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password_hash: passwordHash,
      },
    });
  }

  /**
   * Actualizar datos de un usuario
   */
  async update(
    id: string,
    data: Partial<{
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    }>,
    currentUserId?: string
  ) {
    // Verificar permisos si se proporciona currentUserId
    if (currentUserId) {
      const canModify = await this.canModifyUser(currentUserId, id);
      if (!canModify) {
        throw Object.assign(new Error('Permisos insuficientes para modificar este usuario'), {
          statusCode: 403,
        });
      }
    }

    const prev = await prisma.user.findUnique({ where: { id } });
    if (!prev) {
      throw Object.assign(new Error('Usuario no encontrado'), {
        statusCode: 404,
      });
    }

    const updated = await prisma.user.update({ where: { id }, data });
    
    // Audit logging
    if (data.email && data.email !== prev?.email) {
      auditLog('email_changed', { userId: id, oldEmail: prev?.email, newEmail: data.email }, currentUserId);
    }
    
    return updated;
  }

  /**
   * Soft delete: desactiva al usuario sin eliminarlo
   */
  async softDelete(id: string, currentUserId?: string) {
    // Verificar permisos si se proporciona currentUserId
    if (currentUserId) {
      const canModify = await this.canModifyUser(currentUserId, id);
      if (!canModify) {
        throw Object.assign(new Error('Permisos insuficientes para eliminar este usuario'), {
          statusCode: 403,
        });
      }
    }

    await prisma.user.update({
      where: { id },
      data: { is_active: false },
    });
    auditLog('user_soft_deleted', { userId: id }, currentUserId);
  }
}
