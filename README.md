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

## ⚙️ Primeros pasos

### 1. Clona el repositorio y configura el entorno

```bash
git clone https://github.com/Diegomarte9/SecureAuth-Pro.git
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

## 🚀 Despliegue: Desarrollo vs Producción

### 🔧 Desarrollo (hot reload, nodemon)

- Usa el servicio `app-dev` para desarrollo local con recarga automática:

```bash
docker-compose up app-dev
```
- Cambios en el código se reflejan al instante (hot reload).
- Acceso a Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Usa una base de datos y pgAdmin locales (también levantados por Docker Compose).

### 🏭 Producción (código compilado, seguro)

- Usa el servicio `app` para producción:

```bash
docker-compose up --build app
```
- Solo incluye dependencias y código necesario para producción.
- Asegúrate de tener un archivo `.env` con valores reales y seguros (no subas este archivo a GitHub).
- La ruta `/api-docs` solo estará disponible si defines `SWAGGER_ENABLE=true` en tu `.env`.
- Usa un proxy inverso (Nginx, Caddy, etc.) para HTTPS y mayor seguridad.

### ⚠️ Buenas prácticas y advertencias

- **Nunca uses secretos de desarrollo en producción.**
- Haz backups regulares de la base de datos.
- Monitorea logs y recursos del contenedor.
- Actualiza dependencias y ejecuta los tests antes de desplegar.

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

## 📖 Documentación Interactiva de la API (Swagger)

La API cuenta con documentación interactiva y auto-generada usando **Swagger UI**. Puedes explorar todos los endpoints, probar peticiones y ver ejemplos de request/response fácilmente.

- Accede a la documentación en: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Si usas otro puerto, reemplaza `3000` por el que corresponda.
- En producción, la ruta solo estará disponible si defines la variable de entorno `SWAGGER_ENABLE=true`.

### Ejemplo de autenticación (login)

```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

La respuesta incluirá un `accessToken` (JWT) y un `refreshToken`.

### Usar endpoints protegidos

Agrega el token JWT en el header:

```
Authorization: Bearer <accessToken>
```

### Especificación OpenAPI

Puedes descargar el JSON de la especificación desde la interfaz de Swagger UI para generar clientes en otros lenguajes.

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
