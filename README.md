# SecureAuth-Pro

**SecureAuth-Pro** es una API backend de autenticación y gestión de usuarios, desarrollada en Node.js, TypeScript, Express y PostgreSQL, con enfoque en seguridad, trazabilidad y buenas prácticas modernas.

---

## 🚀 Características principales

- Registro, login y verificación de usuarios vía OTP (correo electrónico)
- Recuperación y reseteo seguro de contraseñas
- Autenticación y autorización basada en JWT (access y refresh tokens)
- **Sistema de roles (USER/ADMIN) con control de acceso granular**
- **Gestión completa de usuarios con permisos basados en roles**
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
- **Control de acceso**: Middleware de roles y validaciones de permisos

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
- **Control de acceso basado en roles (RBAC)**
- **Validación de permisos a nivel de servicio**

---

## 👥 Sistema de Roles y Permisos

### Roles disponibles:
- **USER**: Usuario normal con acceso limitado
- **ADMIN**: Administrador con acceso completo

### Permisos por rol:

#### 🔐 Usuarios con rol USER:
- ✅ Ver su propia información
- ✅ Editar su propia información (campos básicos)
- ❌ Ver información de otros usuarios
- ❌ Editar información de otros usuarios
- ❌ Eliminar usuarios
- ❌ Listar todos los usuarios

#### 🔑 Usuarios con rol ADMIN:
- ✅ Ver información de cualquier usuario
- ✅ Editar información de cualquier usuario (campos básicos)
- ✅ Eliminar usuarios (soft delete)
- ✅ Listar todos los usuarios
- ❌ Cambiar roles (solo vía base de datos)

### Campos editables:
- `username`
- `email`
- `first_name`
- `last_name`
- `password`

### Campos NO editables (solo vía base de datos):
- `role`
- `is_active`
- `is_verified`

---

## 📋 Endpoints de Usuarios

### Autenticación requerida en todos los endpoints excepto POST /users

| Método | Endpoint | Descripción | Roles permitidos |
|--------|----------|-------------|------------------|
| GET | `/users` | Listar usuarios | ADMIN |
| GET | `/users/:id` | Ver usuario específico | Propio usuario o ADMIN |
| POST | `/users` | Crear usuario (signup) | Público |
| PUT | `/users/:id` | Actualizar usuario | Propio usuario o ADMIN |
| DELETE | `/users/:id` | Eliminar usuario (soft delete) | ADMIN |

### Ejemplos de uso:

```bash
# Login para obtener token
POST /auth/login
{
  "email": "admin@example.com",
  "password": "Password123!"
}

# Listar usuarios (solo admin)
GET /users
Authorization: Bearer <admin_token>

# Ver usuario específico
GET /users/123
Authorization: Bearer <user_token>

# Actualizar información propia
PUT /users/123
Authorization: Bearer <user_token>
{
  "first_name": "Nuevo Nombre",
  "email": "nuevo@email.com"
}
```

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

### 4. Crea un usuario admin

```bash
# Conectarse a la base de datos
docker-compose exec db psql -U postgres -d secureauth

# Actualizar rol a ADMIN
UPDATE users SET role = 'ADMIN' WHERE email = 'tu_email@ejemplo.com';
```

### 5. Corre los tests automáticos

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

El sistema mantiene un registro detallado de todas las acciones críticas de seguridad:

### Eventos auditados:

- **Autenticación**:
  - Intentos de login (exitosos y fallidos)
  - Bloqueo de cuenta por intentos fallidos
  - Accesos no autorizados
  - Refresh de tokens
  - Logout

- **Gestión de contraseñas**:
  - Solicitudes de reinicio (forgot password)
  - Cambios de contraseña
  - Expiración de contraseñas
  - Validación de OTP

- **Cuenta de usuario**:
  - Creación de cuenta
  - Verificación de email
  - Cambios en estado (activo/inactivo)
  - Cambios de email

- **Gestión de usuarios**:
  - Visualización de usuarios
  - Actualización de información
  - Eliminación de usuarios (soft delete)
  - Intentos de acceso no autorizado

### Detalles registrados:

- IP del cliente
- ID de usuario (cuando aplica)
- Timestamp
- Detalles específicos del evento
- Intentos restantes (en caso de login)
- Roles requeridos vs roles del usuario
- Acciones realizadas en gestión de usuarios

---

## 🔧 Gestión de Usuarios

### Soft Delete
Los usuarios eliminados no se borran físicamente de la base de datos, sino que se marcan como inactivos (`is_active = false`). Esto permite:
- Mantener historial de auditoría
- Posibilidad de reactivación
- Preservar integridad referencial

### Cambio de roles
Los roles solo se pueden cambiar directamente en la base de datos:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'usuario@ejemplo.com';
```

### Reactivar usuario eliminado
```sql
UPDATE users SET is_active = true WHERE id = 'user_id';
```

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
