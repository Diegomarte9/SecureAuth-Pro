// src/shared/otpGenerator.ts

/**
 * Genera un código OTP numérico de 6 dígitos
 * @returns Código OTP como string, p.ej. "048372"
 */
export function generateOtp(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}
