// src/modules/auth/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { config } from '../../../config/env';

export class AuthController {
  private authService = new AuthService();

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, first_name, last_name, password } = req.body;
      await this.authService.signUp({ username, email, first_name, last_name, password });
      res.status(201).json({ message: 'Usuario creado. OTP enviado al correo.' });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = req.body;
      await this.authService.verifyOtp(email, code, 'verification');
      res.status(200).json({ message: 'Cuenta verificada con éxito.' });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, password } = req.body;
      const tokens = await this.authService.login(user, password);
      res.status(200).json(tokens);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await this.authService.generateResetOtp(email);
      res.status(200).json({ message: 'Si el correo existe, se ha enviado un OTP para restablecer la contraseña.' });
    } catch (err) {
      // Nunca reveles si el email existe o no
      res.status(200).json({ message: 'Si el correo existe, se ha enviado un OTP para restablecer la contraseña.' });
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, type } = req.body;
      await this.authService.resendOtp(email, type);
      res.status(200).json({ message: 'Nuevo OTP enviado.' });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code, newPassword } = req.body;
      await this.authService.resetPassword(email, code, newPassword);
      res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken, req);
      res.status(200).json(tokens);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken, req);
      res.status(200).json({ message: 'Sesión cerrada correctamente.' });
    } catch (err) {
      next(err);
    }
  }
}
