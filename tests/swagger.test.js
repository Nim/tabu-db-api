const request = require('supertest');

// Mock BigQuery and connection pool before requiring modules that use them
jest.mock('@google-cloud/bigquery');
jest.mock('../src/middleware/bigQueryConnectionPool');

describe('Swagger Documentation Tests', () => {
  describe('Development Environment', () => {
    let app;

    beforeAll(() => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      const createApp = require('../src/app');
      app = createApp();
    });

    afterAll(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should serve Swagger JSON at /swagger/json', async () => {
      const response = await request(app).get('/swagger/json');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('openapi', '3.0.0');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title', 'Tabu DB API');
      expect(response.body).toHaveProperty('paths');
      expect(response.body).toHaveProperty('components');
    }, 5000);

    it('should serve Swagger UI at /swagger/', async () => {
      const response = await request(app).get('/swagger/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('swagger-ui');
    }, 5000);

    it('should serve regular API endpoints', async () => {
      const response = await request(app).get('/api/status');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    }, 5000);

    it('should have API paths defined', async () => {
      const response = await request(app).get('/swagger/json');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('paths');
      expect(Object.keys(response.body.paths).length).toBeGreaterThan(0);
      expect(response.body.paths).toHaveProperty('/swagger/json');
    }, 5000);

    it('should not have duplicate /api prefixes', async () => {
      const response = await request(app).get('/swagger/json');
      const paths = Object.keys(response.body.paths);
      const duplicateApiPaths = paths.filter(path => path.includes('/api/api'));
      expect(duplicateApiPaths.length).toBe(0);
    }, 5000);
  });

  describe('Production Environment', () => {
    let app;

    beforeAll(() => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const createApp = require('../src/app');
      app = createApp();
    });

    afterAll(() => {
      process.env.NODE_ENV = 'test';
    });

    const expectedErrorResponse = {
      success: false,
      message: 'API documentation not available in production',
      exists: false,
      action: 'GET',
      type: 'ERROR',
      error: {
        status: 404,
        message: 'API documentation not available in production'
      }
    };

    it('should block Swagger UI access in production - base path', async () => {
      const response = await request(app).get('/swagger');
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expectedErrorResponse);
    }, 5000);

    it('should block Swagger UI access in production - with trailing slash', async () => {
      const response = await request(app).get('/swagger/');
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expectedErrorResponse);
    }, 5000);

    it('should not serve Swagger JSON in production', async () => {
      const response = await request(app).get('/swagger/json');
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expectedErrorResponse);
    }, 5000);

    it('should serve regular API endpoints', async () => {
      const response = await request(app).get('/api/status');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    }, 5000);
  });
});
