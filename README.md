# 🚀 SecureAuth-Pro v2

## ✨ ¿Qué es diferente en v2?

- El registro de usuario requiere aprobación de un administrador.
- No se usa OTP para activar la cuenta tras el registro.
- El usuario queda en estado "pending" tras registrarse y no puede iniciar sesión hasta ser aprobado.
- El administrador recibe notificaciones de nuevas solicitudes y puede aprobar o rechazar usuarios desde la API (listo para dashboard).
- El usuario recibe un correo cuando es aprobado o rechazado.
- Endpoints nuevos: `/users/:id/approve` y `/users/:id/reject` (solo admin).

> **Nota:** Esta versión es ideal para sistemas donde el acceso debe ser controlado manualmente por un administrador (ej: plataformas privadas, empresas, etc).

---

## 🗂️ Índice
1. [📝 Descripción](#-descripción)
2. [📦 Despliegue rápido sin clonar el repositorio](#-despliegue-rápido-sin-clonar-el-repositorio)
3. [⚡ Primeros pasos](#-primeros-pasos)
4. [⚙️ Variables de entorno](#-variables-de-entorno)
5. [⚡ Creación de usuario admin (seed)](#-creación-de-usuario-admin-seed)
6. [🐳 Docker Compose](#-docker-compose)
7. [🛠️ Comandos Docker](#-comandos-docker)
8. [🔒 Características principales](#-características-principales)
9. [🏗️ Arquitectura](#-arquitectura)
10. [🔁 Flujos de trabajo](#-flujos-de-trabajo)
11. [🧑‍💼 Sistema de Roles y Permisos](#-sistema-de-roles-y-permisos)
12. [🔗 Endpoints principales](#-endpoints-principales)
13. [🕵️ Auditoría y seguridad](#-auditoría-y-seguridad)
14. [👥 Gestión de usuarios](#-gestión-de-usuarios)
15. [📚 Documentación Swagger](#-documentación-swagger)
16. [🧪 Testing](#-testing)
17. [📧 Notificaciones por correo](#-notificaciones-por-correo)
18. [🌐 Zona horaria y auditoría](#-zona-horaria-y-auditoría)
19. [💾 Backups de la base de datos](#-backups-de-la-base-de-datos)
20. [🪪 Licencia](#-licencia)

---

## 📝 Descripción

**SecureAuth-Pro** es una API backend de autenticación y gestión de usuarios, desarrollada en Node.js, TypeScript, Express y PostgreSQL, con enfoque en seguridad, trazabilidad y buenas prácticas modernas.

---

## 📦 Despliegue rápido sin clonar el repositorio

> **No necesitas clonar el repositorio para desplegar la aplicación.**
>
> Solo necesitas:
> - El archivo `docker-compose.prod.yml` (o `docker-compose.dev.yml` para desarrollo)
> - El archivo `.env` con tus variables de entorno
> - Docker y Docker Compose instalados en tu servidor

### Ejemplo de despliegue en servidor

1. Copia los archivos necesarios al servidor:
   ```bash
   scp docker-compose.prod.yml .env usuario@mi-servidor:/ruta/destino
   ```
2. En el servidor, levanta los servicios:
   ```bash
   cd /ruta/destino
   docker-compose -f docker-compose.prod.yml up -d
   ```

> **Importante:** El archivo `.env` debe contener todas las variables de entorno requeridas por la aplicación. Puedes usar el `.env.example` del repositorio como referencia.

---

## ⚡ Primeros pasos

### 🛠️ Para desarrollo

1. **Clona el repositorio y configura el entorno**
   ```bash
   git clone https://github.com/Diegomarte9/SecureAuth-Pro.git
   cd SecureAuth-Pro
   cp .env.example .env # y edita tus variables
   ```
2. **Configura las variables de entorno** (ver sección siguiente)

3. **Crea la migración inicial si no existe**
   ```bash
   docker exec secureauth-pro-app-dev-1 npx prisma migrate dev --name init
   ```
4. **Crea un usuario admin** (ver sección [⚡ Creación de usuario admin (seed)](#-creación-de-usuario-admin-seed))

5. **Construye la imagen de desarrollo**
   ```bash
   npm run build:dev
   ```
6. **Levanta los servicios en desarrollo**
   ```bash
   npm run dev:docker:up
   # o
   docker-compose up app-dev db
   ```
7. **Aplica migraciones de Prisma (crea las tablas en la base de datos y genera cliente)**
   ```bash
   docker exec secureauth-pro-app-dev-1 npx prisma migrate dev
   ```
8. **Ejecuta el seed para crear el usuario admin**
   ```bash
   docker exec -it secureauth-pro-app-dev-1 npx ts-node prisma/seed.ts
   # o si ya compilaste:
   docker exec -it secureauth-pro-app-dev-1 node dist/prisma/seed.js
   ```
9. **Corre los tests automáticos**
   ```bash
   docker exec secureauth-pro-app-dev-1 npm test
   ```

---

### 🚀 Para producción

1. **Clona el repositorio y configura el entorno**
   ```bash
   git clone https://github.com/Diegomarte9/SecureAuth-Pro.git
   cd SecureAuth-Pro
   cp .env.example .env # y edita tus variables
   ```
2. **Configura las variables de entorno** (ver sección siguiente)

3. **Crea la migración inicial si no existe**
   > Si es la primera vez que usas el proyecto o no tienes la carpeta `prisma/migrations`, primero debes crear la migración inicial desde desarrollo:
   ```bash
   docker exec secureauth-pro-app-dev-1 npx prisma migrate dev --name init
   ```
   > Esto generará la carpeta y archivos de migración necesarios.
4. **Crea un usuario admin** (ver sección [⚡ Creación de usuario admin (seed)](#-creación-de-usuario-admin-seed))

5. **Construye la imagen de producción**
   ```bash
   npm run build:prod
   ```
6. **Levanta los servicios en producción**
   ```bash
   npm run prod
   # o
   docker-compose up -d app db pgadmin db-backup
   ```
7. **Aplica migraciones de Prisma (crea las tablas en la base de datos)**
   ```bash
   docker exec secureauth-pro-app-1 npx prisma migrate deploy
   ```
8. **Ejecuta el seed para crear el usuario admin**
   ```bash
   docker exec -it secureauth-pro-app-1 node dist/prisma/seed.js
   ```

---

## ⚙️ Variables de entorno

- `DATABASE_URL` — URL de conexión a PostgreSQL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — Secretos para JWT
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — Configuración de email
- `OTP_EXPIRES_MINUTES` — Minutos de validez del OTP
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` — Rate limiting
- `CORS_ORIGIN` — Origen permitido para CORS
- `ADMIN_EMAIL` — Correo del administrador que recibirá notificaciones de nuevos registros. Ejemplo:
  ```env
  ADMIN_EMAIL=admin@tudominio.com
  ```

Ver `.env.example` para la lista completa.

---

## ⚡ Creación de usuario admin (seed)

Para crear un usuario admin inicial en la base de datos puedes usar los scripts de seed incluidos en la carpeta `prisma/`:

- `prisma/seed.example.ts`: Ejemplo seguro, con datos ficticios. Puedes subirlo a GitHub.
- `prisma/seed.ts`: Script real para tu entorno. **No lo subas a GitHub.**

### ¿Cómo usar el seed?
1. Copia `prisma/seed.example.ts` a `prisma/seed.ts` y edita los datos por los reales de tu admin (email, nombre, contraseña, etc).
2. Ejecuta el seed **dentro del contenedor Docker de la app**:
   ```bash
   docker exec -it secureauth-pro-app-dev-1 npx ts-node prisma/seed.ts
   ```
   > Cambia el nombre del contenedor si usas otro (puedes ver el nombre con `docker ps`).
3. El usuario admin quedará creado o actualizado en la base de datos.

**Importante:** Agrega `prisma/seed.ts` a tu `.gitignore` para evitar subir datos sensibles:
```bash
# En tu .gitignore
prisma/seed.ts
```

---

## 🐳 Docker Compose

- **Producción:**
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```
- **Desarrollo:**
  ```bash
  docker-compose -f docker-compose.dev.yml up -d
  ```

> Asegúrate de tener tu archivo `.env` configurado antes de levantar los servicios.

---

## 🛠️ Comandos Docker

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

## 🔒 Características principales

- Registro, login y verificación de usuarios vía OTP (correo electrónico)
- Recuperación y reseteo seguro de contraseñas
- Autenticación y autorización basada en JWT (access y refresh tokens)
- Sistema de roles (USER/ADMIN) con control de acceso granular
- Gestión completa de usuarios con permisos basados en roles
- Auditoría profesional de todas las acciones críticas
- Pruebas automáticas de seguridad
- Despliegue con Docker y Prisma

---

## 🏗️ Arquitectura

- **Node.js + Express**: API RESTful modular y escalable
- **Prisma ORM**: Modelado seguro y migraciones automáticas
- **PostgreSQL**: Base de datos relacional robusta
- **Docker**: Despliegue y desarrollo reproducible

---

## 🔁 Flujos de trabajo

### Producción
1. **Build:**
   ```bash
   npm run build:prod
   ```
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
1. **Build:**  `npm run build:dev`
2. **Levantar servicios:**  `npm run dev:docker:up`
3. **Build y levantar todo:**  `npm run build:dev && npm run dev:docker:up`

---

## 🧑‍💼 Sistema de Roles y Permisos

- **USER:** Ver y editar solo su propia información.
- **ADMIN:** Ver, editar y eliminar cualquier usuario, listar todos los usuarios.
- **Campos editables:** username, email, first_name, last_name, password
- **Campos NO editables vía API:** role, is_active, is_verified

---

## 🔗 Endpoints principales

| Método | Endpoint      | Descripción                        | Roles permitidos         |
|--------|--------------|------------------------------------|--------------------------|
| GET    | `/users`     | Listar usuarios                    | ADMIN                    |
| GET    | `/users/:id` | Ver usuario específico             | Propio usuario o ADMIN   |
| POST   | `/users`     | Crear usuario (signup)             | Público                  |
| PUT    | `/users/:id` | Actualizar usuario                 | Propio usuario o ADMIN   |
| DELETE | `/users/:id` | Eliminar usuario (soft delete)     | ADMIN                    |

---

## 🕵️ Auditoría y seguridad

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

---

## 👥 Gestión de usuarios

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

## 📚 Documentación Swagger

- Accede a la documentación en: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- En producción, la ruta solo estará disponible si defines la variable de entorno `SWAGGER_ENABLE=true`.
- Puedes descargar el JSON de la especificación desde la interfaz de Swagger UI para generar clientes en otros lenguajes.

---

## 🧪 Testing

- Pruebas automáticas en `tests/auth/` y `tests/users/`
- Ejecuta `npm test` para validar la seguridad del sistema en local
- **Para correr los tests dentro de Docker (recomendado):**

  ```bash
  docker exec secureauth-pro-app-dev-1 npm test
  ```

---

## 📧 Notificaciones por correo

El sistema envía notificaciones automáticas por correo electrónico en los siguientes eventos de seguridad y cuenta:

- **Verificación exitosa de cuenta:** Cuando el usuario verifica su cuenta tras ingresar el OTP.
- **Muchos intentos fallidos de inicio de sesión:** Se envía una advertencia si hay varios intentos fallidos seguidos.
- **Cuenta bloqueada:** Si la cuenta es bloqueada temporalmente por intentos fallidos, se notifica al usuario.
- **Restablecimiento de contraseña exitoso:** Cuando el usuario restablece su contraseña correctamente.
- **Cambio de contraseña exitoso:** Cuando el usuario cambia su contraseña desde el panel autenticado.

Asegúrate de configurar correctamente las variables SMTP en tu `.env` para que el envío de correos funcione.

---

## 🌐 Zona horaria y auditoría

Todos los timestamps y logs de auditoría se almacenan en formato UTC (tiempo universal coordinado), siguiendo las mejores prácticas para sistemas distribuidos y multiusuario.

---

## 💾 Backups de la base de datos

Puedes realizar backups de tu base de datos PostgreSQL de forma manual o automática:

### Backup manual

Ejecuta el siguiente script para crear un backup manual en el directorio `./db_backups`:

```bash
./backup_db.sh
```

Esto generará un archivo SQL con la fecha y hora en el nombre.

### Backup automático (Docker)

El proyecto incluye un servicio `db-backup` en `docker-compose.yml` que realiza backups automáticos diarios y los guarda en `./db_backups`.

---

## 🪪 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## ⚠️ Importante: ¡Nunca subas a producción sin la carpeta de migraciones!

> **Si subes tu proyecto a producción sin la carpeta `prisma/migrations`, Prisma NO creará tus tablas de negocio (usuarios, OTP, etc.), solo la tabla `_prisma_migrations`.**

### ¿Por qué ocurre esto?
- Prisma solo aplica migraciones que ya existen en la carpeta `prisma/migrations`.
- Si solo tienes el archivo `schema.prisma` pero no hay migraciones generadas, al ejecutar:
  ```bash
  docker exec secureauth-pro-app-1 npx prisma migrate deploy
  ```
  verás:
  ```
  No migration found in prisma/migrations
  No pending migrations to apply.
  ```
- **Resultado:** Solo se crea la tabla `_prisma_migrations` y tu app no funcionará.

### Flujo correcto para tener todas las tablas:
1. **En desarrollo:**
   - Ejecuta:
     ```bash
     docker exec secureauth-pro-app-dev-1 npx prisma migrate dev --name init
     ```
   - Esto crea la carpeta y archivos de migración en `prisma/migrations/`.
2. **Sube el código a producción incluyendo la carpeta `prisma/migrations`.**
3. **En producción:**
   - Ejecuta:
     ```bash
     docker exec secureauth-pro-app-1 npx prisma migrate deploy
     ```
   - Ahora sí, Prisma aplicará las migraciones y creará todas las tablas.

> **Nunca omitas este paso. Si no tienes la carpeta de migraciones, tu base de datos estará vacía (excepto por `_prisma_migrations`).**