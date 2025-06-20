// src/modules/auth/services/auth.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/env';
import { EmailService } from './email.service';
import { auditLog } from '../../../shared/auditLogger';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class AuthService {
  private emailService = new EmailService();

  /**
   * Registra un nuevo usuario y envía OTP de verificación
   */
  async signUp(data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) {
    // 1. Crear usuario con hash de contraseña y status 'pending'
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password_hash: passwordHash,
        status: 'pending',
      },
    });
    auditLog('user_created', { userId: user.id, email: user.email });

    // 2. Notificar al admin por correo sobre la nueva solicitud
    await this.emailService.sendAdminNewSignupRequest(user);
  }

  /**
   * Verifica el código OTP para verificación o reset y marca el OTP como usado
   */
  async verifyOtp(
    email: string,
    code: string,
    type: 'verification' | 'reset'
  ) {
    const otp = await prisma.otp.findFirst({
      where: {
        code,
        type,
        used: false,
        expires_at: { gt: new Date() },
        user: { email },
      },
      include: { user: true },
    });
    if (!otp) {
      auditLog('otp_verification_failed', { email, type, code }, undefined);
      throw Object.assign(new Error('Código OTP inválido o expirado'), {
        statusCode: 400,
      });
    }

    // Marcar OTP como usado
    await prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Si es verificación de cuenta, activar al usuario
    if (type === 'verification') {
      await prisma.user.update({
        where: { id: otp.user_id },
        data: { is_verified: true },
      });
      auditLog('account_verified', { userId: otp.user_id, email }, otp.user_id);
      // Notificar por correo que la cuenta fue verificada
      await this.emailService.sendAccountVerifiedEmail(email);
    }
  }

  /**
   * Autentica usuario y genera tokens JWT
   */
  async login(userOrEmail: string, password: string, req: any) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: userOrEmail }, { email: userOrEmail }],
      },
    });
    if (!user || !user.is_active) {
      auditLog('login_failed', { userOrEmail, reason: 'not_found_or_inactive', ip: req.ip }, undefined);
      throw Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 });
    }
    // Solo permite login a usuarios activos
    if (user.status !== 'active') {
      let reason = 'pending';
      if (user.status === 'pending') reason = 'pending_approval';
      if (user.status === 'rejected') reason = 'rejected';
      auditLog('login_failed', { userId: user.id, userOrEmail, reason, ip: req.ip }, user.id);
      if (user.status === 'pending') {
        throw Object.assign(new Error('Tu cuenta está pendiente de aprobación por un administrador.'), { statusCode: 403 });
      } else if (user.status === 'rejected') {
        throw Object.assign(new Error('Tu solicitud de registro fue rechazada.'), { statusCode: 403 });
      } else {
        throw Object.assign(new Error('No puedes iniciar sesión en este momento.'), { statusCode: 403 });
      }
    }
    if (!user.is_verified) {
      auditLog('login_failed', { userId: user.id, userOrEmail, reason: 'not_verified', ip: req.ip }, user.id);
      throw Object.assign(new Error('Cuenta no verificada. Por favor revisa tu correo y verifica tu cuenta antes de iniciar sesión.'), {
        statusCode: 401,
      });
    }

    // Bloqueo temporal tras muchos intentos fallidos
    const MAX_ATTEMPTS = 5;
    const BLOCK_MINUTES = 15;
    const now = new Date();
    if (user.locked_until && user.locked_until > now) {
      auditLog('login_blocked', { userId: user.id, email: user.email, until: user.locked_until, ip: req.ip }, user.id);
      throw Object.assign(new Error('Cuenta bloqueada temporalmente. Intenta de nuevo más tarde.'), { statusCode: 403 });
    }

    // Política de expiración y rotación de contraseñas
    const PASSWORD_MAX_AGE_DAYS = 90;
    if (user.force_password_change || (user.password_changed_at && (new Date().getTime() - new Date(user.password_changed_at).getTime()) > PASSWORD_MAX_AGE_DAYS * 24 * 60 * 60 * 1000)) {
      auditLog('password_expired', { userId: user.id, email: user.email, ip: req.ip }, user.id);
      throw Object.assign(new Error('Debes cambiar tu contraseña antes de continuar.'), { statusCode: 403 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_attempts: { increment: 1 },
          locked_until: (user.failed_attempts + 1 >= MAX_ATTEMPTS)
            ? new Date(Date.now() + BLOCK_MINUTES * 60 * 1000)
            : user.locked_until,
        },
      });
      // Notificar advertencia si está cerca de bloquearse
      if (user.failed_attempts + 1 === MAX_ATTEMPTS - 1) {
        await this.emailService.sendLoginAttemptsWarning(user.email, user.failed_attempts + 1);
      }
      if (user.failed_attempts + 1 >= MAX_ATTEMPTS) {
        // Notifica por email bloqueo
        await this.emailService.sendAccountLockedEmail(user.email, BLOCK_MINUTES);
        auditLog('account_locked', { 
          userId: user.id, 
          email: user.email, 
          attempts: user.failed_attempts + 1,
          lockDuration: `${BLOCK_MINUTES} minutes`,
          ip: req.ip 
        }, user.id);
      }
      auditLog('login_failed', { 
        userId: user.id, 
        userOrEmail, 
        reason: 'invalid_password',
        attempts: user.failed_attempts + 1,
        remainingAttempts: MAX_ATTEMPTS - (user.failed_attempts + 1),
        ip: req.ip 
      }, user.id);
      throw Object.assign(new Error('Credenciales inválidas'), {
        statusCode: 401,
      });
    }

    // Resetear intentos fallidos al login exitoso
    await prisma.user.update({ where: { id: user.id }, data: { failed_attempts: 0, locked_until: null } });
    auditLog('login_success', { userId: user.id, userOrEmail, ip: req.ip }, user.id);

    const payload = { sub: user.id };
    const accessToken = jwt.sign(payload, config.jwtAccessSecret, {
      expiresIn: config.jwtAccessExpires,
    } as any);
    const refreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
      },
    });
    return { accessToken, refreshToken };
  }

  /**
   * Genera y envía OTP para restablecimiento de contraseña
   */
  async generateResetOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Simula el mismo tiempo de procesamiento para evitar ataques de enumeración
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Auditar intento aunque el usuario no exista (sin userId)
      auditLog('forgot_password_requested', { email, exists: false }, undefined);
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + config.otpExpiresMinutes * 60000);
    await prisma.otp.create({
      data: {
        user_id: user.id,
        code,
        type: 'reset',
        expires_at: expiresAt,
      },
    });

    await this.emailService.sendOtpEmail(user.email, code, 'reset');
    // Auditar solicitud exitosa
    auditLog('forgot_password_requested', { email, exists: true }, user.id);
  }

  /**
   * Reenvía OTP existente o crea uno nuevo según lógica de negocio
   */
  async resendOtp(email: string, type: 'verification' | 'reset') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw Object.assign(new Error('Usuario no encontrado'), {
        statusCode: 404,
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + config.otpExpiresMinutes * 60000);
    await prisma.otp.create({
      data: {
        user_id: user.id,
        code,
        type,
        expires_at: expiresAt,
      },
    });

    await this.emailService.sendOtpEmail(user.email, code, type);
  }

  /**
   * Verifica OTP de reset y actualiza la contraseña
   */
  async resetPassword(email: string, code: string, newPassword: string) {
    await this.verifyOtp(email, code, 'reset');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { password_hash: passwordHash, password_changed_at: new Date(), force_password_change: false },
    });

    const user = await prisma.user.findUnique({ where: { email } });
    auditLog('password_reset', { email }, user?.id);
    // Notificar por correo que el password fue reseteado
    if (user) {
      await this.emailService.sendPasswordResetSuccess(user.email);
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) throw Object.assign(new Error('Contraseña actual incorrecta'), { statusCode: 401 });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password_hash: passwordHash, password_changed_at: new Date(), force_password_change: false } });
    auditLog('password_changed', { userId, email: user.email }, userId);
    // Notificar por correo que el password fue cambiado
    await this.emailService.sendPasswordChanged(user.email);
  }

  async refreshToken(token: string, req: any) {
    // Busca el refresh token en la base de datos
    const dbToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!dbToken || dbToken.revoked || dbToken.expires_at < new Date()) {
      auditLog('refresh_failed', { token, ip: req.ip }, dbToken?.user_id);
      throw Object.assign(new Error('Refresh token inválido o expirado'), { statusCode: 401 });
    }
    // Busca el usuario
    const user = await prisma.user.findUnique({ where: { id: dbToken.user_id } });
    if (!user || !user.is_active || !user.is_verified) {
      auditLog('refresh_failed', { token, reason: 'user_invalid', ip: req.ip }, dbToken.user_id);
      throw Object.assign(new Error('Usuario inválido'), { statusCode: 401 });
    }
    // Genera nuevos tokens
    const payload = { sub: user.id };
    const accessToken = jwt.sign(payload, config.jwtAccessSecret, {
      expiresIn: config.jwtAccessExpires,
    } as any);
    // Opcional: puedes rotar el refresh token
    const newRefreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: newRefreshToken,
        expires_at: expiresAt,
      },
    });
    // Revoca el anterior
    await prisma.refreshToken.update({ where: { token }, data: { revoked: true } });
    auditLog('refresh_success', { userId: user.id, ip: req.ip }, user.id);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string, req: any) {
    // Revoca el refresh token
    await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
    auditLog('logout', { token, ip: req.ip }, undefined);
  }
}
