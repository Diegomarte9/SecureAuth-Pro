// src/server.ts
import { config } from './config/env';
import { prisma, initializeDatabase } from './config/db';
import { createApp } from './app';

async function start() {
  try {
    // 1. Conectar Prisma
    await prisma.$connect();
    console.log('🔌 Conexión a la base de datos establecida.');

    // 2. Inicializar esquema
    await initializeDatabase();

    // 3. Crear y arrancar Express
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
