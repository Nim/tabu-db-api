const { expect } = require('chai').expect;
const request = require('supertest');
const app = require('../src/index');

describe('API Routes Test Suite', () => {
  it('should return a 200 status for the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).to.equal(200);
  });

  it('should return a 200 status for the /api endpoint', async () => {
    const response = await request(app).get('/api');
    expect(response.status).to.equal(200);
  });

  it('should return a 404 status for a non-existent endpoint', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).to.equal(404);
  });
});
