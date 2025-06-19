import request from 'supertest';
import app from '../../src/app';

describe('DELETE /users/:id', () => {
  it('debería requerir autenticación', async () => {
    const res = await request(app)
      .delete('/users/1');
    expect(res.statusCode).toBe(401);
  });
}); 