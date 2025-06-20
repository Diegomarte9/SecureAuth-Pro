import dotenv from 'dotenv';

dotenv.config();

function getEnvVar(key: string, defaultValue?: string): string{
    const value = process.env[key] ?? defaultValue;
    if (typeof value === 'undefined'){
        throw new Error('La variable de entorno "${key" no esta definida.');
    }
    return value;
}

export const config = {
    port: Number(getEnvVar('PORT', '3000')),
    databaseUrl: getEnvVar('DATABASE_URL'),
    jwtAccessSecret: getEnvVar('JWT_ACCESS_SECRET'),
    jwtRefreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
    jwtAccessExpires: getEnvVar('JWT_ACCESS_EXPIRES', '15m'),
    jwtRefreshExpires: getEnvVar('JWT_REFRESH_EXPIRES', '7d'),

    smtp: {
        host: getEnvVar('SMTP_HOST'),
        port: Number(getEnvVar('SMTP_PORT', '587')),
        user: getEnvVar('SMTP_USER'),
        pass: getEnvVar('SMTP_PASS'),
        from: getEnvVar('SMTP_FROM', 'soportemdev@gmail.com'),
    },

    otpExpiresMinutes: Number(getEnvVar('OTP_EXPIRES_MINUTES', '10')),

    rateLimitWindowMs: Number(getEnvVar('RATE_LIMIT_WINDOW_MS', String(15 * 60 * 1000))), // 1 minuto
    rateLimitMaxRequests: Number(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100')), // 100 solicitudes por ventana

    adminEmail: getEnvVar('ADMIN_EMAIL', 'admin@tudominio.com'),
};