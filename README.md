# 🚀 SecureAuth-Pro v2

Un backend de autenticación robusto y seguro construido con Node.js, Express, TypeScript y PostgreSQL. Diseñado para ofrecer seguridad, trazabilidad y un flujo de aprobación de usuarios administrado.

## ✨ Características Principales de la v2

- **Aprobación de Administrador:** El registro de nuevos usuarios requiere la aprobación explícita de un administrador.
- **Flujo sin OTP inicial:** La activación de la cuenta se realiza tras la aprobación del administrador, no mediante un OTP enviado al correo.
- **Estado `pending`:** Los usuarios recién registrados quedan en estado "pendiente" y no pueden iniciar sesión hasta que su cuenta sea aprobada.
- **Notificaciones por Correo:** Se notifica tanto al administrador (nuevas solicitudes) como al usuario (aprobación o rechazo).
- **Endpoints de Gestión:** Incluye endpoints (`/users/:id/approve` y `/users/:id/reject`) para que los administradores gestionen las solicitudes.

> **Nota:** Esta versión es ideal para sistemas donde el acceso debe ser controlado manualmente, como plataformas internas de empresas, sistemas B2B o comunidades privadas.

---

## 🗂️ Índice

1. [Primeros Pasos (Desarrollo)](#-primeros-pasos-desarrollo)
2. [Configuración (Producción)](#-configuración-producción)
3. [Variables de Entorno](#-variables-de-entorno)
4. [Usuario Administrador (Seed)](#-usuario-administrador-seed)
5. [Scripts Disponibles](#-scripts-disponibles)
6. [Docker y Docker Compose](#-docker-y-docker-compose)
7. [Endpoints Principales](#-endpoints-principales)
8. [Auditoría y Seguridad](#-auditoría-y-seguridad)
9. [Testing](#-testing)
10. [Backups](#-backups-de-la-base-de-datos)
11. [Licencia](#-licencia)

---

## 🚀 Primeros Pasos (Desarrollo)

Sigue estos pasos para levantar el entorno de desarrollo localmente.

### Requisitos

- [Node.js](https://nodejs.org/en/) (versión 20 o superior)
- [Docker](https://www.docker.com/products/docker-desktop/) y Docker Compose

### 1. Clonar y Configurar el Entorno

```bash
# Clona el repositorio
git clone https://github.com/Diegomarte9/SecureAuth-Pro.git

# Entra al directorio del proyecto
cd SecureAuth-Pro

# Crea tu archivo de variables de entorno a partir del ejemplo
cp .env.example .env
```

### 2. Edita tus Variables de Entorno

Abre el archivo `.env` que acabas de crear y ajusta los valores, especialmente la configuración de la base de datos y los secretos JWT.

### 3. Levanta los Servicios con Docker

Este comando construirá las imágenes de Docker (si no existen) y levantará los contenedores de la aplicación, la base de datos y pgAdmin.

```bash
npm run dev:up
```

### 4. Aplica las Migraciones de la Base de Datos

Con los contenedores en ejecución, ejecuta las migraciones de Prisma para crear las tablas en tu base de datos.

```bash
# Este comando se ejecuta dentro del contenedor de la aplicación
docker exec secureauth-pro-app-dev-1 npm run prisma:migrate
```

> **Nota:** Si es la primera vez que ejecutas el proyecto, puede que necesites crear una migración inicial. Usa `docker exec secureauth-pro-app-dev-1 npx prisma migrate dev --name init`.

### 5. Crea el Usuario Administrador

El proyecto incluye un script "seed" para crear un usuario administrador inicial.

```bash
# 1. Copia el ejemplo para crear tu propio script de seed
cp prisma/seed.example.ts prisma/seed.ts

# 2. Edita prisma/seed.ts con los datos reales de tu administrador

# 3. Ejecuta el script de seed dentro del contenedor
docker exec -it secureauth-pro-app-dev-1 npx ts-node prisma/seed.ts
```

**¡Listo!** La API debería estar funcionando en `http://localhost:3000`.

---

## ⚙️ Configuración (Producción)

Para desplegar en un entorno de producción, los pasos son similares, pero utilizando los comandos y archivos de configuración de producción.

1. **Configura tu `.env`** con las variables de producción.
2. **Construye la imagen de Docker para producción:**
   ```bash
   npm run build:prod
   ```
3. **Levanta los servicios en modo "detached":**
   ```bash
   npm run prod
   ```
4. **Aplica las migraciones en el servidor de producción:**
   ```bash
   docker exec secureauth-pro-app-1 npm run prisma:deploy
   ```
5. **Crea el usuario administrador (seed) en producción:**
   ```bash
   # Asegúrate de que tu `prisma/seed.ts` está en el servidor (sin subirlo a Git)
   docker exec -it secureauth-pro-app-1 node dist/prisma/seed.js
   ```

---

## 📝 Variables de Entorno

Copia `.env.example` a `.env` y rellena las variables. Las más importantes son:

- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Claves secretas para firmar los JSON Web Tokens.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Configuración del servidor de correo para el envío de notificaciones.
- `ADMIN_EMAIL`: Correo del administrador que recibirá las notificaciones de nuevos registros.

---

## 👤 Usuario Administrador (Seed)

Para crear un usuario admin inicial, el proyecto utiliza un script de `seed`.

1.  **Copia el ejemplo:** `cp prisma/seed.example.ts prisma/seed.ts`.
2.  **Edita `prisma/seed.ts`** con los datos reales del administrador (nombre, email, contraseña).
3.  **Asegúrate de que `prisma/seed.ts` esté en tu `.gitignore`** para no subir datos sensibles al repositorio.

Para ejecutar el seed, usa el comando correspondiente a tu entorno (ver secciones de desarrollo/producción).

---

## 🛠️ Scripts Disponibles

Estos son los scripts más importantes definidos en `package.json`.

| Comando `npm run` | Descripción                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `dev`             | Inicia la aplicación en modo desarrollo con `nodemon` (sin Docker).       |
| `dev:up`          | Levanta los contenedores de desarrollo (`app-dev`, `db`, `pgadmin`).        |
| `prod`            | Levanta los contenedores de producción (`app`, `db`, `pgadmin`, `db-backup`). |
| `prod:core`       | Levanta solo los contenedores esenciales (`app`, `db`, `db-backup`).      |
| `build`           | Compila el código TypeScript a JavaScript (en `dist/`).                     |
| `build:prod`      | Construye la imagen de Docker para producción (`app`).                    |
| `build:dev`       | Construye la imagen de Docker para desarrollo (`app-dev`).                |
| `prisma:migrate`  | Ejecuta las migraciones de Prisma para desarrollo (`migrate dev`).          |
| `prisma:deploy`   | Ejecuta las migraciones de Prisma para producción (`migrate deploy`).       |
| `test`            | Ejecuta la suite de tests con Jest.                                       |
| `down`            | Detiene y elimina los contenedores de Docker.                             |
| `down:volumenes`  | Detiene y elimina contenedores y volúmenes. **(¡CUIDADO!)**             |

---

## 🐳 Docker y Docker Compose

El proyecto está completamente dockerizado para facilitar el despliegue y la consistencia entre entornos.

-   **`docker-compose.yml`**: Define los servicios base (`db`, `pgadmin`).
-   **`docker-compose.dev.yml`**: Extiende la base para el entorno de desarrollo. Incluye `app-dev` con hot-reloading.
-   **`docker-compose.prod.yml`**: Extiende la base para el entorno de producción. Incluye `app` optimizada y `db-backup`.
-   **`Dockerfile`**: Define la imagen de producción multi-etapa para un tamaño reducido y mayor seguridad.
-   **`Dockerfile.dev`**: Define la imagen de desarrollo.

---

## 🔗 Endpoints Principales

La documentación completa de la API está disponible a través de Swagger en `http://localhost:3000/api-docs`.

-   `POST /auth/register` - Registro de un nuevo usuario (queda en estado `pending`).
-   `POST /auth/login` - Inicio de sesión.
-   `POST /auth/refresh-token` - Refrescar el token de acceso.
-   `GET /users` - Listar todos los usuarios (solo ADMIN).
-   `PATCH /users/:id/approve` - Aprobar un registro de usuario (solo ADMIN).
-   `PATCH /users/:id/reject` - Rechazar un registro de usuario (solo ADMIN).

---

## 🕵️ Auditoría y Seguridad

-   **Logs de Auditoría:** Todas las acciones críticas (cambios de email, aprobación/rechazo de usuarios, etc.) se registran en la tabla `AuditLog`.
-   **Hashing de Contraseñas:** Se utiliza `bcrypt` para el hash seguro de contraseñas.
-   **Middleware de Seguridad:** Se utilizan `helmet`, `cors` y `rate-limiter` para proteger la API contra vulnerabilidades comunes.

---

## 🧪 Testing

El proyecto utiliza **Jest** y **Supertest** para las pruebas de integración. Para ejecutar los tests:

```bash
# Dentro del contenedor de la aplicación
npm test
```

Los tests cubren los flujos de autenticación, gestión de usuarios y comprobaciones de seguridad.

---

## 💾 Backups de la Base de Datos

En el entorno de producción (`docker-compose.prod.yml`), se incluye un servicio `db-backup` que realiza copias de seguridad periódicas de la base de datos PostgreSQL.

-   Los backups se guardan en el volumen `db_backups`.
-   El script `backup_db.sh` gestiona la lógica de creación y rotación de backups.

---

## 🪪 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.