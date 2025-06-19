import { EmailService } from '../modules/auth/services/email.service';

const emailService = new EmailService();

export async function notifyUser(email: string, subject: string, message: string) {
  // Enviar email (puedes extender a SMS, push, etc.)
  await emailService.sendGenericEmail(email, subject, message);
} 