import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/forgot-password', () => {
  it('debería responder con éxito aunque el email no exista (por seguridad)', async () => {
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({
        email: 'noexiste@example.com'
      });
    expect([200, 201, 204]).toContain(res.statusCode);
  });
}); 