import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/signup', () => {
  it('debería registrar un usuario y enviar OTP', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'testuser1@example.com',
        password: 'Password123!',
        username: 'testuser1'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  it('debería fallar si el email ya existe', async () => {
    await request(app)
      .post('/auth/signup')
      .send({
        email: 'testuser2@example.com',
        password: 'Password123!',
        username: 'testuser2'
      });
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'testuser2@example.com',
        password: 'Password123!',
        username: 'testuser2'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
}); 