// src/modules/users/services/users.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { auditLog } from '../../../shared/auditLogger';

const prisma = new PrismaClient();

export class UsersService {
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
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
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
      is_active: boolean;
      is_verified: boolean;
      is_admin?: boolean;
    }>
  ) {
    const prev = await prisma.user.findUnique({ where: { id } });
    const updated = await prisma.user.update({ where: { id }, data });
    if (data.email && data.email !== prev?.email) {
      auditLog('email_changed', { userId: id, oldEmail: prev?.email, newEmail: data.email }, id);
    }
    if (typeof data.is_active === 'boolean' && data.is_active !== prev?.is_active) {
      auditLog('user_active_status_changed', { userId: id, from: prev?.is_active, to: data.is_active }, id);
    }
    if (typeof data.is_verified === 'boolean' && data.is_verified !== prev?.is_verified) {
      auditLog('user_verified_status_changed', { userId: id, from: prev?.is_verified, to: data.is_verified }, id);
    }
    if (typeof data.is_admin === 'boolean' && data.is_admin !== (prev as any)?.is_admin) {
      auditLog('user_admin_status_changed', { userId: id, from: (prev as any)?.is_admin, to: data.is_admin }, id);
    }
    return updated;
  }

  /**
   * Soft delete: desactiva al usuario sin eliminarlo
   */
  async softDelete(id: string) {
    await prisma.user.update({
      where: { id },
      data: { is_active: false },
    });
    auditLog('user_soft_deleted', { userId: id }, id);
  }
}
