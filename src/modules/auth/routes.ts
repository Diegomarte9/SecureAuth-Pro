// src/modules/auth/routes.ts
import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";
import { validateDto } from "../../middlewares/validate-dto";
import {
  SignupDto,
  VerifyOtpDto,
  LoginDto,
  ForgotPasswordDto,
  ResendOtpDto,
  ResetPasswordDto,
} from "./dtos";
import { asyncHandler } from '../../shared/asyncHandler';
import { loginRateLimiter } from '../../middlewares/rateLimiter';

export const authRouter = Router();
const auth = new AuthController();

// Registro de usuario + envío de OTP
authRouter.post("/signup", validateDto(SignupDto), asyncHandler((req, res, next) =>
  auth.signup(req, res, next)
));

// Verificación de OTP tras signup
authRouter.post("/verify-otp", validateDto(VerifyOtpDto), asyncHandler((req, res, next) =>
  auth.verifyOtp(req, res, next)
));

// Login y generación de JWT
authRouter.post(
  "/login",
  loginRateLimiter,
  validateDto(LoginDto),
  asyncHandler((req, res, next) => auth.login(req, res, next))
);

// Solicitar OTP de restablecimiento
authRouter.post(
  "/forgot-password",
  validateDto(ForgotPasswordDto),
  asyncHandler((req, res, next) => auth.forgotPassword(req, res, next))
);

// Reenviar OTP (verificación o reset)
authRouter.post("/resend-otp", validateDto(ResendOtpDto), asyncHandler((req, res, next) =>
  auth.resendOtp(req, res, next)
));

// Restablecer contraseña
authRouter.post(
  "/reset-password",
  validateDto(ResetPasswordDto),
  asyncHandler((req, res, next) => auth.resetPassword(req, res, next))
);

// Endpoint para refrescar el access token
authRouter.post(
  '/refresh-token',
  asyncHandler((req, res, next) => auth.refreshToken(req, res, next))
);

// Cierra sesión y revoca el refresh token
authRouter.post(
  '/logout',
  asyncHandler((req, res, next) => auth.logout(req, res, next))
);
