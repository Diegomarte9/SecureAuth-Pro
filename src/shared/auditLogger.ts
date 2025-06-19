import fs from 'fs';
import path from 'path';
import { prisma } from '../config/db';

const LOG_PATH = path.resolve(process.cwd(), 'audit.log');

export async function auditLog(event: string, details: Record<string, any>, userId?: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  };
  // Log en consola
  console.log(`[AUDIT] ${logEntry.timestamp} | ${event} |`, details);
  // Log en archivo
  fs.appendFileSync(LOG_PATH, JSON.stringify(logEntry) + '\n');
  // Log en base de datos
  try {
    await prisma.auditLog.create({
      data: {
        event,
        details,
        userId: userId ?? null,
      },
    });
  } catch (err) {
    console.error('Error guardando log de auditoría en la base de datos:', err);
  }
} 