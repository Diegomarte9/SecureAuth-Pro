import 'reflect-metadata';
import { config } from './config/env';
import { createApp } from './app';
import { PrismaClient } from '@prisma/client';

async function start() {
  try {
    // Conectar Prisma y confirmar conexión
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('🔌 Conexión a la base de datos establecida.');

    // Crear y arrancar Express
    const app = createApp();
    app.listen(config.port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar la aplicación:', err);
    process.exit(1);
  }
}

start();
