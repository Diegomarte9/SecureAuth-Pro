import request from 'supertest';
import app from '../../src/app';

describe('PUT /users/:id', () => {
  it('debería requerir autenticación', async () => {
    const res = await request(app)
      .put('/users/1')
      .send({
        username: 'actualizado'
      });
    expect(res.statusCode).toBe(401);
  });
}); 