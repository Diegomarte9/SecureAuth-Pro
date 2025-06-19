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
 * components:
 *   schemas:
 *     SignupDto:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *         - passwordConfirm
 *       properties:
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         first_name:
 *           type: string
 *           example: John
 *         last_name:
 *           type: string
 *           example: Doe
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *     LoginDto:
 *       type: object
 *       required:
 *         - user
 *         - password
 *       properties:
 *         user:
 *           type: string
 *           description: Puede ser username o email
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *       example:
 *         user: johndoe@example.com
 *         password: Password123!
 */

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

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verifica el OTP recibido por email tras el registro
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpDto'
 *           example:
 *             email: johndoe@example.com
 *             code: "123456"
 *     responses:
 *       200:
 *         description: Usuario verificado correctamente
 *       400:
 *         description: OTP inválido o expirado
 *
 *   components:
 *     schemas:
 *       VerifyOtpDto:
 *         type: object
 *         required:
 *           - email
 *           - code
 *         properties:
 *           email:
 *             type: string
 *             format: email
 *           code:
 *             type: string
 *             minLength: 6
 *             maxLength: 6
 */
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

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita un OTP para restablecer la contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordDto'
 *           example:
 *             email: johndoe@example.com
 *     responses:
 *       200:
 *         description: Si el email existe, se envía un OTP de reseteo
 *       400:
 *         description: Error de validación
 *
 * /auth/reset-password:
 *   post:
 *     summary: Restablece la contraseña usando el OTP recibido por email
 *     tags: [Auth]
 *     description: >-
 *       Debes haber solicitado un OTP de reseteo y verificarlo aquí junto con la nueva contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordDto'
 *           example:
 *             email: johndoe@example.com
 *             code: "123456"
 *             newPassword: Password123!
 *             newPasswordConfirm: Password123!
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *       400:
 *         description: OTP inválido, expirado o error de validación
 *
 *   components:
 *     schemas:
 *       ForgotPasswordDto:
 *         type: object
 *         required:
 *           - email
 *         properties:
 *           email:
 *             type: string
 *             format: email
 *             example: johndoe@example.com
 *       ResetPasswordDto:
 *         type: object
 *         required:
 *           - email
 *           - code
 *           - newPassword
 *           - newPasswordConfirm
 *         properties:
 *           email:
 *             type: string
 *             format: email
 *             example: johndoe@example.com
 *           code:
 *             type: string
 *             minLength: 6
 *             maxLength: 6
 *             example: "123456"
 *           newPassword:
 *             type: string
 *             format: password
 *             example: Password123!
 *           newPasswordConfirm:
 *             type: string
 *             format: password
 *             example: Password123!
 */
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: 4cb3058f-4aee-4ee9-aefa-0a1c95551d38
 *           example:
 *             refreshToken: 4cb3058f-4aee-4ee9-aefa-0a1c95551d38
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
authRouter.post(
  '/logout',
  asyncHandler((req, res, next) => auth.logout(req, res, next))
);
