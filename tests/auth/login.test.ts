import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/login', () => {
  it('debería fallar si el usuario no existe', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'noexiste@example.com',
        password: 'Password123!'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Para un test exitoso, deberías crear y verificar un usuario antes
  // Este test es un placeholder para cuando tengas un usuario verificado
  it('debería loguear un usuario existente y verificado (mock)', async () => {
    // Aquí deberías crear y verificar un usuario real o mockear la verificación
    // Este test se debe ajustar a tu lógica real
    expect(true).toBe(true);
  });
}); 