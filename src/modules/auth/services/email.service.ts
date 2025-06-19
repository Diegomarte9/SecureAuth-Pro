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
}
