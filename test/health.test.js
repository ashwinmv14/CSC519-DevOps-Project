const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  it('returns 200 and OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(String(res.text || res.body?.status || '')).toMatch(/ok/i);
  });
});
