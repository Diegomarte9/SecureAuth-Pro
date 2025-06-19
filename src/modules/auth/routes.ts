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

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Registro de usuario y envío de OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupDto'
 *     responses:
 *       201:
 *         description: Usuario registrado, OTP enviado
 *       400:
 *         description: Error de validación
 */
// Registro de usuario + envío de OTP
authRouter.post("/signup", validateDto(SignupDto), asyncHandler((req, res, next) =>
  auth.signup(req, res, next)
));

// Verificación de OTP tras signup
authRouter.post("/verify-otp", validateDto(VerifyOtpDto), asyncHandler((req, res, next) =>
  auth.verifyOtp(req, res, next)
));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario (solo usuarios verificados)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Login exitoso, retorna access y refresh token
 *       401:
 *         description: Credenciales inválidas o usuario no verificado
 */
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

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresca el access token usando el refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Nuevo access token
 *       401:
 *         description: Refresh token inválido o expirado
 */
// Endpoint para refrescar el access token
authRouter.post(
  '/refresh-token',
  asyncHandler((req, res, next) => auth.refreshToken(req, res, next))
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cierra sesión y revoca el refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
authRouter.post(
  '/logout',
  asyncHandler((req, res, next) => auth.logout(req, res, next))
);
