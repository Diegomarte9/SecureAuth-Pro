import request from 'supertest';
import app from '../../src/app';

describe('POST /users', () => {
  it('debería requerir autenticación', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        email: 'nuevo@example.com',
        password: 'Password123!',
        username: 'nuevo'
      });
    expect(res.statusCode).toBe(401);
  });
}); 