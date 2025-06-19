// src/config/db.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

/**
 * Inicializa la base de datos:
 * - Activa extensión pgcrypto para UUIDs
 * - Crea tablas users y otps si no existen
 * - Configura trigger updated_at en users
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔄 Inicializando base de datos...');

  // 1. Activar extensión pgcrypto para UUID
  await prisma.$executeRawUnsafe(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `);
  console.log('✅ Extensión pgcrypto verificada/creada.');

  // 2. Crear tabla users
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      password_changed_at TIMESTAMPTZ,
      force_password_change BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✅ Tabla users verificada/creada.');

  // 3. Crear tabla otps
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code CHAR(6) NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('verification','reset')),
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✅ Tabla otps verificada/creada.');

  // 4. Trigger updated_at en users
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION set_updated_at_column()
      RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_users_updated_at ON users;`);
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at_column();
  `);
  console.log('✅ Trigger updated_at en users configurado.');

  // 5. Crear tabla audit_logs
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      event TEXT NOT NULL,
      details JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✅ Tabla audit_logs verificada/creada.');

  console.log('🎉 Inicialización de BD completada.');
}
