# Security Guide

## Auditoría de acciones

Para auditar cualquier acción crítica, usa el helper centralizado:

```ts
import { auditLog } from './src/shared/auditLogger';

auditLog('nombre_evento', { detalles: 'relevantes' }, userId);
```

- El `nombre_evento` debe ser descriptivo (ej: `user_created`, `password_changed`, `unauthorized_access`).
- El objeto de detalles puede incluir cualquier información relevante (nunca contraseñas).
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

## ¿Dudas?

Consulta a los responsables de seguridad del proyecto o revisa los helpers en `src/shared/`. 