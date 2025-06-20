// src/modules/auth/services/email.service.ts
import nodemailer from 'nodemailer';
import { config } from '../../../config/env';

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });

  /**
   * Envía un correo con el código OTP
   */
  async sendOtpEmail(
    email: string,
    code: string,
    type: 'verification' | 'reset'
  ) {
    const subject =
      type === 'verification'
        ? 'Verifica tu cuenta SecureAuth Pro'
        : 'Restablece tu contraseña SecureAuth Pro';
    const text = `Tu código OTP es: ${code}. Expira en ${config.otpExpiresMinutes} minutos.`;

    await this.transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject,
      text,
    });
  }

  /**
   * Envía un correo genérico
   */
  async sendGenericEmail(email: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject,
      text,
    });
  }

  /**
   * Notifica al usuario que su cuenta fue verificada exitosamente
   */
  async sendAccountVerifiedEmail(email: string) {
    const subject = '¡Tu cuenta ha sido verificada!';
    const text = 'Tu cuenta en SecureAuth Pro ha sido verificada exitosamente. Ya puedes iniciar sesión.';
    await this.sendGenericEmail(email, subject, text);
  }

  /**
   * Notifica al usuario que ha habido muchos intentos fallidos de inicio de sesión
   */
  async sendLoginAttemptsWarning(email: string, attempts: number) {
    const subject = 'Muchos intentos fallidos de inicio de sesión';
    const text = `Hemos detectado ${attempts} intentos fallidos de inicio de sesión en tu cuenta. Si no fuiste tú, te recomendamos cambiar tu contraseña.`;
    await this.sendGenericEmail(email, subject, text);
  }

  /**
   * Notifica al usuario que su cuenta ha sido bloqueada temporalmente
   */
  async sendAccountLockedEmail(email: string, minutes: number) {
    const subject = 'Tu cuenta ha sido bloqueada temporalmente';
    const text = `Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión. Podrás intentar de nuevo en ${minutes} minutos.`;
    await this.sendGenericEmail(email, subject, text);
  }

  /**
   * Notifica al usuario que su contraseña fue restablecida exitosamente
   */
  async sendPasswordResetSuccess(email: string) {
    const subject = 'Contraseña restablecida exitosamente';
    const text = 'Tu contraseña ha sido restablecida correctamente. Si no fuiste tú, contacta soporte de inmediato.';
    await this.sendGenericEmail(email, subject, text);
  }

  /**
   * Notifica al usuario que su contraseña fue cambiada desde el panel autenticado
   */
  async sendPasswordChanged(email: string) {
    const subject = 'Contraseña cambiada exitosamente';
    const text = 'Tu contraseña ha sido cambiada correctamente. Si no fuiste tú, contacta soporte de inmediato.';
    await this.sendGenericEmail(email, subject, text);
  }

  /**
   * Notifica al admin sobre una nueva solicitud de registro
   */
  async sendAdminNewSignupRequest(user: any) {
    // Enviar correo real al admin con los datos del usuario
    await this.transporter.sendMail({
      from: config.smtp.from,
      to: config.adminEmail || 'admin@tudominio.com', // Usa variable de entorno o hardcodea
      subject: 'Nueva solicitud de registro pendiente',
      text: `Hay una nueva solicitud de registro:

Email: ${user.email}
Nombre: ${user.first_name} ${user.last_name}
Username: ${user.username}

Por favor, revisa la plataforma para aprobar o rechazar la solicitud.`
    });
  }

  /**
   * Notifica al usuario que su solicitud fue aprobada
   */
  async sendUserApprovedEmail(email: string) {
    // TODO: Personaliza el asunto y el cuerpo del correo
    await this.transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: '¡Tu cuenta ha sido aprobada! 🎉',
      text: 'Tu cuenta ha sido aprobada por un administrador. Ya puedes iniciar sesión en la plataforma.'
    });
  }

  /**
   * Notifica al usuario que su solicitud fue rechazada
   */
  async sendUserRejectedEmail(email: string) {
    // TODO: Personaliza el asunto y el cuerpo del correo
    await this.transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Solicitud de registro rechazada',
      text: 'Lamentablemente, tu solicitud de registro fue rechazada por un administrador.'
    });
  }
}
