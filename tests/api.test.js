const express = require('express');
const request = require('supertest');
const { initDb } = require('../src/db');

beforeAll(() => {
  process.env.DATABASE_FILE = ':memory:';
  initDb();
});

describe('API routes', () => {
  let app;
  beforeAll(() => {
    jest.resetModules();
    const apiRoutes = require('../src/routes/api');
    app = express();
    app.use('/api', apiRoutes);
  });

  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/sources returns array', async () => {
    const res = await request(app).get('/api/sources');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/deals returns empty message when no deals', async () => {
    const res = await request(app).get('/api/deals');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
