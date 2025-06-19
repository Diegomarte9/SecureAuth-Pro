# SecureAuth-Pro

**SecureAuth-Pro** es una API backend de autenticación y gestión de usuarios, desarrollada en Node.js, TypeScript, Express y PostgreSQL, con enfoque en seguridad, trazabilidad y buenas prácticas modernas.

---

## 🚀 Características principales

- Registro, login y verificación de usuarios vía OTP (correo electrónico)
- Recuperación y reseteo seguro de contraseñas
- Autenticación y autorización basada en JWT (access y refresh tokens)
- Almacenamiento y revocación de refresh tokens
- Política de contraseñas fuertes y rotación/expiración
- Bloqueo temporal tras intentos fallidos de login
- Rate limiting global y específico para login
- Auditoría profesional de todas las acciones críticas (en base de datos, archivo y consola)
- Notificaciones de seguridad por email
- Pruebas automáticas de seguridad
- Preparado para despliegue con Docker y Prisma

---

## 🏗️ Arquitectura

- **Node.js + Express**: API RESTful modular y escalable
- **Prisma ORM**: Modelado seguro y migraciones automáticas
- **PostgreSQL**: Base de datos relacional robusta
- **Docker**: Despliegue y desarrollo reproducible
- **Auditoría**: Logs en base de datos, archivo y consola
- **Notificaciones**: Email (fácil de extender a SMS, push, etc.)

---

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Validación exhaustiva de datos con DTOs y class-validator
- JWT seguro y con expiración
- OTP para operaciones críticas
- Rate limiting y bloqueo de cuenta
- Protección contra enumeración de usuarios
- Solo usuarios verificados pueden loguear
- Auditoría de todos los eventos sensibles
- Política de expiración y rotación de contraseñas
- Variables sensibles en `.env`
- CORS configurable

---

## ⚙️ Despliegue y uso

### 1. Clona el repositorio y configura el entorno

```bash
git clone <repo-url>
cd SecureAuth-Pro
cp .env.example .env # y edita tus variables
```

### 2. Levanta la base de datos y la app con Docker

```bash
docker-compose up --build
```

### 3. Aplica migraciones de Prisma (si usas migraciones)

```bash
npx prisma migrate dev --name init
```

### 4. Corre los tests automáticos

```bash
npm test
```

---

## 🛠️ Variables de entorno principales

- `DATABASE_URL` — URL de conexión a PostgreSQL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — Secretos para JWT
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — Configuración de email
- `OTP_EXPIRES_MINUTES` — Minutos de validez del OTP
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` — Rate limiting
- `CORS_ORIGIN` — Origen permitido para CORS

Ver `.env.example` para la lista completa.

---

## 🧪 Testing y seguridad

- Pruebas automáticas en `tests/auth/` y `tests/users/`
- Cubre login, rate limit, bloqueo, refresh/logout, rutas protegidas, expiración de contraseña
- Ejecuta `npm test` para validar la seguridad del sistema

---

## 🕵️ Auditoría y trazabilidad

- Todos los eventos críticos quedan registrados en la tabla `audit_logs`, en `audit.log` y en consola
- Usa el helper `auditLog` para auditar nuevas acciones
- Consulta la guía `SECURITY_GUIDE.md` para mejores prácticas

---

## 📬 Notificaciones

- El helper `notifyUser` permite enviar emails ante eventos críticos (bloqueo, cambio de contraseña, etc.)
- Fácil de extender a otros canales (SMS, push)

---

## 👥 Contribución

1. Haz fork del repo y crea una rama
2. Sigue las guías de seguridad y testing
3. Haz tu PR con una descripción clara

---

## 📚 Recursos útiles

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Docs](https://expressjs.com/)
- [Node.js Docs](https://nodejs.org/)
- [Docker Docs](https://docs.docker.com/)

---

## 🛡️ Contacto y soporte

Para dudas, soporte o reportar vulnerabilidades, contacta al equipo de seguridad del proyecto.
