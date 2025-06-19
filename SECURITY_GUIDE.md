# Security Guide

## Auditoría de acciones

Para auditar cualquier acción crítica, usa el helper centralizado:

```ts
import { auditLog } from './src/shared/auditLogger';

auditLog('nombre_evento', { detalles: 'relevantes' }, userId);
```

### Eventos comunes y sus detalles

#### Autenticación

```ts
// Login fallido
auditLog('login_failed', {
  userId: user.id,
  userOrEmail,
  reason: 'invalid_password',
  attempts: user.failed_attempts + 1,
  remainingAttempts: MAX_ATTEMPTS - (user.failed_attempts + 1),
  ip: req.ip
}, user.id);

// Bloqueo de cuenta
auditLog('account_locked', {
  userId: user.id,
  email: user.email,
  attempts: user.failed_attempts + 1,
  lockDuration: '15 minutes',
  ip: req.ip
}, user.id);

// Acceso no autorizado
auditLog('unauthorized_access', {
  reason: 'invalid_token',
  ip: req.ip,
  path: req.path
}, undefined);
```

#### Gestión de contraseñas

```ts
// Solicitud de reinicio
auditLog('forgot_password_requested', {
  email,
  exists: true, // o false si el email no existe
  ip: req.ip
}, user?.id);

// Cambio de contraseña
auditLog('password_changed', {
  userId,
  email: user.email,
  ip: req.ip
}, userId);

// Expiración de contraseña
auditLog('password_expired', {
  userId: user.id,
  email: user.email,
  ip: req.ip
}, user.id);
```

#### Cuenta de usuario

```ts
// Creación de cuenta
auditLog('user_created', {
  userId: user.id,
  email: user.email
});

// Verificación de cuenta
auditLog('account_verified', {
  userId: user.id,
  email,
  ip: req.ip
}, user.id);

// Cambio de email
auditLog('email_changed', {
  userId: id,
  oldEmail: prev?.email,
  newEmail: data.email,
  ip: req.ip
}, id);
```

- El `nombre_evento` debe ser descriptivo y consistente.
- Los detalles deben incluir información relevante para investigación.
- Incluye siempre la IP del cliente cuando esté disponible.
- NUNCA incluyas contraseñas ni datos sensibles en los logs.
- El `userId` es opcional, pero recomendable si está disponible.

---

## Notificaciones de usuario

Para notificar a un usuario ante eventos críticos (bloqueo, cambio de contraseña, etc.):

```ts
import { notifyUser } from './src/shared/notifyUser';

await notifyUser(email, 'Asunto', 'Mensaje para el usuario');
```

Puedes extender este helper para SMS, push, etc.

---

## Pruebas automáticas de seguridad

Agrega tus tests en `tests/auth/` o `tests/users/` siguiendo el patrón:

```ts
it('debe bloquear la cuenta tras varios intentos fallidos', async () => {
  // ...
});
```

Cubre:
- Login solo si verificado
- Rate limit
- Bloqueo tras intentos fallidos
- Refresh/logout
- Acceso a rutas protegidas
- Forzar cambio de contraseña si expiró

---

## Consulta de logs

Los logs se almacenan en tres lugares:

1. **Base de datos** (`audit_logs`):
```sql
-- Ver intentos fallidos por IP
SELECT * FROM audit_logs 
WHERE event = 'login_failed' 
ORDER BY created_at DESC;

-- Ver bloqueos de cuenta
SELECT * FROM audit_logs 
WHERE event = 'account_locked' 
ORDER BY created_at DESC;

-- Ver actividad por usuario
SELECT * FROM audit_logs 
WHERE user_id = 'user_id_here'
ORDER BY created_at DESC;
```

2. **Archivo** (`audit.log`):
- Formato JSON para fácil parsing
- Rotación automática por tamaño/fecha
- Útil para herramientas de monitoreo

3. **Consola** (en desarrollo):
- Formato legible para debugging
- Solo en ambiente de desarrollo

---

## ¿Dudas?

Consulta a los responsables de seguridad del proyecto o revisa los helpers en `src/shared/`. 