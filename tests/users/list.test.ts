import request from 'supertest';
import app from '../../src/app';

describe('GET /users', () => {
  it('debería requerir autenticación', async () => {
    const res = await request(app)
      .get('/users');
    expect(res.statusCode).toBe(401);
  });
}); 