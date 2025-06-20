# SecureAuth-Pro

## Índice
1. [Descripción](#descripción)
2. [Características principales](#características-principales)
3. [Arquitectura](#arquitectura)
4. [Primeros pasos](#primeros-pasos)
5. [🚀 Despliegue rápido en servidor usando Docker Hub](#despliegue-rápido-en-servidor-usando-docker-hub)
6. [Comandos Docker Simplificados](#comandos-docker-simplificados)
7. [🐳 Docker Compose para Producción y Desarrollo](#docker-compose-para-producción-y-desarrollo)
8. [Flujos de trabajo recomendados](#flujos-de-trabajo-recomendados)
9. [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)
10. [Endpoints principales](#endpoints-principales)
11. [Variables de entorno](#variables-de-entorno)
12. [Auditoría y seguridad](#auditoría-y-seguridad)
13. [Gestión de usuarios](#gestión-de-usuarios)
14. [Documentación Swagger](#documentación-swagger)
15. [Testing](#testing)
16. [Notificaciones por correo](#notificaciones-por-correo)
17. [Zona horaria y auditoría](#zona-horaria-y-auditoría)
18. [Backups de la base de datos](#backups-de-la-base-de-datos)
19. [Licencia](#licencia)

---

## Descripción

**SecureAuth-Pro** es una API backend de autenticación y gestión de usuarios, desarrollada en Node.js, TypeScript, Express y PostgreSQL, con enfoque en seguridad, trazabilidad y buenas prácticas modernas.

---

## Características principales

- Registro, login y verificación de usuarios vía OTP (correo electrónico)
- Recuperación y reseteo seguro de contraseñas
- Autenticación y autorización basada en JWT (access y refresh tokens)
- Sistema de roles (USER/ADMIN) con control de acceso granular
- Gestión completa de usuarios con permisos basados en roles
- Auditoría profesional de todas las acciones críticas
- Pruebas automáticas de seguridad
- Despliegue con Docker y Prisma

---

## Arquitectura

- **Node.js + Express**: API RESTful modular y escalable
- **Prisma ORM**: Modelado seguro y migraciones automáticas
- **PostgreSQL**: Base de datos relacional robusta
- **Docker**: Despliegue y desarrollo reproducible

---

## Primeros pasos

1. **Clona el repositorio y configura el entorno**
   ```bash
   git clone https://github.com/Diegomarte9/SecureAuth-Pro.git
   cd SecureAuth-Pro
   cp .env.example .env # y edita tus variables
   ```

2. **Construye la imagen de producción**
   ```bash
   npm run build:prod
   ```

3. **Levanta la base de datos y la app en producción**
   ```bash
   npm run prod:core
   # o para levantar también pgadmin:
   npm run prod
   ```

4. **(Desarrollo) Construye y levanta el entorno de desarrollo**
   ```bash
   npm run build:dev
   npm run dev:docker:up
   ```

5. **Aplica migraciones de Prisma**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Crea un usuario admin**
   ```bash
   docker-compose exec db psql -U postgres -d secureauth
   # Luego en SQL:
   UPDATE users SET role = 'ADMIN' WHERE email = 'tu_email@ejemplo.com';
   ```

7. **Corre los tests automáticos**
   ```bash
   docker exec secureauth-pro-app-dev-1 npm test
   ```

---

## 🚀 Despliegue rápido en servidor usando Docker Hub

Para desplegar la aplicación en cualquier servidor, solo necesitas:

1. El archivo `docker-compose.prod.yml` (o `docker-compose.dev.yml` para desarrollo)
2. El archivo `.env` con tus variables de entorno
3. Docker y Docker Compose instalados

No es necesario clonar el repositorio ni tener el código fuente.

### Ejemplo de despliegue

```bash
# Copia los archivos necesarios al servidor
scp docker-compose.prod.yml .env usuario@mi-servidor:/ruta/destino

# En el servidor:
cd /ruta/destino
docker-compose -f docker-compose.prod.yml up -d
```

> **Importante:** El archivo `.env` debe contener todas las variables de entorno requeridas por la aplicación. Puedes usar el `.env.example` del repositorio como referencia.

---

## 🐳 Docker Compose para Producción y Desarrollo

A partir de ahora puedes usar archivos separados para levantar el entorno de producción o desarrollo usando imágenes de Docker Hub sin necesidad de clonar el repositorio:

### Producción
Utiliza la imagen optimizada y publicada en Docker Hub (`diegomarte/secureauth-pro:latest`).

```bash
docker-compose -f docker-compose.prod.yml up -d
```
Esto levantará los servicios: app, db, pgadmin y backups. Puedes personalizar el archivo para tu entorno.

### Desarrollo
Utiliza la imagen de desarrollo (`diegomarte/secureauth-pro:dev`) y bind mount para el código fuente local.

```bash
docker-compose -f docker-compose.dev.yml up -d
```
Esto levantará los servicios: app-dev, db y pgadmin, permitiendo hot reload y desarrollo ágil.

> **Nota:** Asegúrate de tener tu archivo `.env` configurado antes de levantar los servicios.

---

## 🐳 Comandos Docker Simplificados

### Producción
- **Build:**
  ```bash
  npm run build:prod
  ```
- **Levantar servicios (app, db, pgadmin y backups):**
  ```bash
  npm run prod
  ```
- **Levantar servicios (solo app, db y backups):**
  ```bash
  npm run prod:core
  ```
- **Build y levantar todo:**
  ```bash
  npm run build:prod && npm run prod
  ```

### Desarrollo
- **Build:** `npm run build:dev`
- **Levantar:** `npm run dev:docker:up`
- **Build y levantar:** `npm run build:dev && npm run dev:docker:up`

### Control
- **Detener todo:** `npm run down`

### Equivalencias docker-compose

| Comando npm                | Equivalente docker-compose                  |
|---------------------------|---------------------------------------------|
| `npm run prod`            | `docker-compose up app db pgadmin`          |
| `npm run prod:core`       | `docker-compose up app db`                  |
| `npm run build:prod`      | `docker-compose build --no-cache app`       |
| `npm run start:prod`      | `docker-compose up app db`                  |
| `npm run build:dev`       | `docker-compose build --no-cache app-dev`   |
| `npm run dev:docker:up`   | `docker-compose up app-dev db`              |
| `npm run dev:docker:build`| `docker-compose build --no-cache app-dev`   |
| `npm run down`            | `docker-compose down`                       |

---

## Flujos de trabajo recomendados

### Producción
1. **Build:**
   ```bash
   npm run build:prod
   ```
   (solo si hiciste cambios en el código)
2. **Levantar servicios (app, db, pgadmin y backups):**
   ```bash
   npm run prod
   ```
   o solo app, db y backups:
   ```bash
   npm run prod:core
   ```
3. **Levantar todo después de build:**
   ```bash
   npm run build:prod && npm run prod
   ```

### Desarrollo
1. **Build:**  
   `npm run build:dev`
2. **Levantar servicios:**  
   `npm run dev:docker:up`
3. **Build y levantar todo:**  
   `npm run build:dev && npm run dev:docker:up`

---

## Sistema de Roles y Permisos

- **USER:** Ver y editar solo su propia información.
- **ADMIN:** Ver, editar y eliminar cualquier usuario, listar todos los usuarios.
- **Campos editables:** username, email, first_name, last_name, password
- **Campos NO editables vía API:** role, is_active, is_verified

---

## Endpoints principales

| Método | Endpoint      | Descripción                        | Roles permitidos         |
|--------|--------------|------------------------------------|--------------------------|
| GET    | `/users`     | Listar usuarios                    | ADMIN                    |
| GET    | `/users/:id` | Ver usuario específico             | Propio usuario o ADMIN   |
| POST   | `/users`     | Crear usuario (signup)             | Público                  |
| PUT    | `/users/:id` | Actualizar usuario                 | Propio usuario o ADMIN   |
| DELETE | `/users/:id` | Eliminar usuario (soft delete)     | ADMIN                    |

**Ejemplo de uso:**
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

## Variables de entorno

- `DATABASE_URL` — URL de conexión a PostgreSQL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — Secretos para JWT
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — Configuración de email
- `OTP_EXPIRES_MINUTES` — Minutos de validez del OTP
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` — Rate limiting
- `CORS_ORIGIN` — Origen permitido para CORS

Ver `.env.example` para la lista completa.

---

## Auditoría y seguridad

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
- Control de acceso basado en roles (RBAC)
- Validación de permisos a nivel de servicio

### Eventos auditados
- Intentos de login (exitosos y fallidos)
- Bloqueo de cuenta por intentos fallidos
- Accesos no autorizados
- Refresh de tokens
- Logout
- Solicitudes de reinicio y cambios de contraseña
- Expiración de contraseñas
- Validación de OTP
- Creación y verificación de cuenta
- Cambios en estado (activo/inactivo)
- Cambios de email
- Visualización, actualización y eliminación de usuarios
- Intentos de acceso no autorizado

---

## Gestión de usuarios

- **Soft Delete:** Los usuarios eliminados no se borran físicamente, solo se marcan como inactivos (`is_active = false`).
- **Cambio de roles:** Solo vía base de datos:
  ```sql
  UPDATE users SET role = 'ADMIN' WHERE email = 'usuario@ejemplo.com';
  ```
- **Reactivar usuario eliminado:**
  ```sql
  UPDATE users SET is_active = true WHERE id = 'user_id';
  ```

---

## Documentación Swagger

- Accede a la documentación en: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- En producción, la ruta solo estará disponible si defines la variable de entorno `SWAGGER_ENABLE=true`.
- Puedes descargar el JSON de la especificación desde la interfaz de Swagger UI para generar clientes en otros lenguajes.

**Ejemplo de autenticación (login):**
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Agrega el token JWT en el header:
```
Authorization: Bearer <accessToken>
```

---

## Testing

- Pruebas automáticas en `tests/auth/` y `tests/users/`
- Ejecuta `npm test` para validar la seguridad del sistema en local
- **Para correr los tests dentro de Docker (recomendado):**

  ```bash
  docker exec secureauth-pro-app-dev-1 npm test
  ```

---

## Notificaciones por correo

El sistema envía notificaciones automáticas por correo electrónico en los siguientes eventos de seguridad y cuenta:

- **Verificación exitosa de cuenta:** Cuando el usuario verifica su cuenta tras ingresar el OTP.
- **Muchos intentos fallidos de inicio de sesión:** Se envía una advertencia si hay varios intentos fallidos seguidos.
- **Cuenta bloqueada:** Si la cuenta es bloqueada temporalmente por intentos fallidos, se notifica al usuario.
- **Restablecimiento de contraseña exitoso:** Cuando el usuario restablece su contraseña correctamente.
- **Cambio de contraseña exitoso:** Cuando el usuario cambia su contraseña desde el panel autenticado.

Asegúrate de configurar correctamente las variables SMTP en tu `.env` para que el envío de correos funcione.

---

## Zona horaria y auditoría

Todos los timestamps y logs de auditoría se almacenan en formato UTC (tiempo universal coordinado), siguiendo las mejores prácticas para sistemas distribuidos y multiusuario.

- **¿Por qué UTC?**
  - Evita problemas de horario de verano y diferencias regionales.
  - Permite comparar eventos de diferentes países sin ambigüedad.

- **¿Cómo saber la hora local?**
  - Convierte el timestamp UTC a tu zona horaria local usando herramientas como:
    - JavaScript/Node.js: [`date-fns-tz`](https://date-fns.org/v2.29.3/docs/Time-Zones) o [`moment-timezone`](https://momentjs.com/timezone/)
    - PostgreSQL: `SELECT created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santo_Domingo'`
    - Linux/macOS: `TZ=America/Santo_Domingo date -d '2024-06-21T12:57:18Z'`

- **Importante:**
  - La "Z" al final del timestamp significa que está en UTC.
  - No pierdes información: siempre puedes convertir a cualquier zona horaria.

---

## Backups de la base de datos

Puedes realizar backups de tu base de datos PostgreSQL de forma manual o automática:

### Backup manual

Ejecuta el siguiente script para crear un backup manual en el directorio `./db_backups`:

```bash
./backup_db.sh
```

Esto generará un archivo SQL con la fecha y hora en el nombre.

### Backup automático (Docker)

El proyecto incluye un servicio `db-backup` en `docker-compose.yml` que realiza backups automáticos diarios y los guarda en `./db_backups`.

- El backup se ejecuta automáticamente cada día.
- Puedes ajustar la frecuencia y retención en el archivo `docker-compose.yml` (variables `SCHEDULE`, `BACKUP_KEEP_DAYS`, etc).
- Para iniciar el servicio de backup automático:

```bash
docker-compose up -d db-backup
```

- Para verificar los backups generados:

```bash
ls db_backups/
```

### Restaurar un backup

Para restaurar un backup generado (manual o automático):

```bash
cat db_backups/backup_YYYYMMDD_HHMMSS.sql | docker exec -i secureauth-pro-db-1 psql -U postgres -d secureauth
```

Reemplaza `YYYYMMDD_HHMMSS` por la fecha y hora del archivo que quieras restaurar.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.