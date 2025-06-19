import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP en 15 minutos
  message: {
    error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
