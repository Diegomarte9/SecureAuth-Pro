// src/shared/hash.ts
import bcrypt from 'bcrypt';

/**
 * Genera el hash de una contraseña
 * @param password - Texto plano de la contraseña
 * @param saltRounds - Número de rondas para bcrypt (default 12)
 */
export async function hashPassword(password: string, saltRounds = 12): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compara una contraseña con su hash
 * @param password - Texto plano de la contraseña
 * @param hash - Hash almacenado en base de datos
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
