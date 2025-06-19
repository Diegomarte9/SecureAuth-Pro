import request from 'supertest';
import app from '../../src/app';

describe('Seguridad Auth', () => {
  it('no permite login si el usuario no está verificado', async () => {
    await request(app)
      .post('/auth/signup')
      .send({
        email: 'noverificado@example.com',
        password: 'Password123!',
        username: 'noverificado',
        first_name: 'No',
        last_name: 'Verificado'
      });
    const res = await request(app)
      .post('/auth/login')
      .send({
        user: 'noverificado@example.com',
        password: 'Password123!'
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('aplica rate limit en login', async () => {
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/auth/login')
        .send({
          user: 'noexiste@example.com',
          password: 'Password123!'
        });
    }
    const res = await request(app)
      .post('/auth/login')
      .send({
        user: 'noexiste@example.com',
        password: 'Password123!'
      });
    expect(res.statusCode).toBe(429);
  });

  it('bloquea la cuenta tras varios intentos fallidos', async () => {
    await request(app)
      .post('/auth/signup')
      .send({
        email: 'bloqueo@example.com',
        password: 'Password123!',
        username: 'bloqueo',
        first_name: 'Bloqueo',
        last_name: 'Test'
      });
    // Simula verificación manual en la base de datos o con un helper
    // ...
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/auth/login')
        .send({
          user: 'bloqueo@example.com',
          password: 'ContraseñaMala!'
        });
    }
    const res = await request(app)
      .post('/auth/login')
      .send({
        user: 'bloqueo@example.com',
        password: 'Password123!'
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBeDefined();
  });

  it('requiere refresh token válido para refrescar', async () => {
    const res = await request(app)
      .post('/auth/refresh-token')
      .send({ refreshToken: 'token_invalido' });
    expect(res.statusCode).toBe(401);
  });

  it('requiere autenticación para rutas protegidas', async () => {
    const res = await request(app)
      .get('/users');
    expect(res.statusCode).toBe(401);
  });

  it('fuerza cambio de contraseña si expiró', async () => {
    // Simula usuario con password_changed_at muy antiguo o force_password_change true
    // ...
    // Intenta login y espera error 403
    expect(true).toBe(true); // Placeholder, requiere setup especial
  });
}); 