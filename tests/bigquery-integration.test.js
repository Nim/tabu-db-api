const request = require('supertest');
const createApp = require('../src/app');
const config = require('../src/config/config');
const { queryBigQuery } = require('../src/models/bigQuery');
const apiRoute = config.server.apiRoute;

// This test uses a real BigQuery connection, no mocking!
describe('BigQuery Pagination Integration Tests', () => {
  let app;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // Set NODE_ENV to test to load the test environment routes
    process.env.NODE_ENV = 'test';
    
    // Create app using the createApp function
    app = createApp();

    // Ensure we're using the real BigQuery model, not a mock
    jest.unmock('../src/models/bigQuery');
  });

  describe('Salary table pagination', () => {
    const tableName = 'salary';
    
    it('should return data with default pagination (limit=10, offset=0)', async () => {
      const response = await request(app)
        .get(`${apiRoute}/${tableName}`)
        .expect(200);
      
      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toHaveProperty('records');
      expect(response.body.response).toHaveProperty('pagination');
      
      // Verify pagination metadata
      expect(response.body.response.pagination).toHaveProperty('limit', config.pagination.limit);
      expect(response.body.response.pagination).toHaveProperty('offset', config.pagination.offset);
      expect(response.body.response.pagination).toHaveProperty('hasMore');
      
      // Verify data
      expect(Array.isArray(response.body.response.records)).toBe(true);
      expect(response.body.response.records.length).toBeLessThanOrEqual(config.pagination.limit);
    });

    it('should return data with custom limit (limit=5, offset=0)', async () => {
      const customLimit = 5;
      const response = await request(app)
        .get(`${apiRoute}/${tableName}?limit=${customLimit}`)
        .expect(200);
      
      // Verify pagination metadata
      expect(response.body.response.pagination).toHaveProperty('limit', customLimit);
      expect(response.body.response.pagination).toHaveProperty('offset', config.pagination.offset);
      
      // Verify data length
      expect(response.body.response.records.length).toBeLessThanOrEqual(customLimit);
    });

    it('should return data with custom offset (limit=10, offset=10)', async () => {
      const customOffset = 10;
      const response = await request(app)
        .get(`${apiRoute}/${tableName}?offset=${customOffset}`)
        .expect(200);
      
      // Verify pagination metadata
      expect(response.body.response.pagination).toHaveProperty('limit', config.pagination.limit);
      expect(response.body.response.pagination).toHaveProperty('offset', customOffset);
    });

    it('should return different pages of data when changing offset', async () => {
      // Get first page
      const firstPageResponse = await request(app)
        .get(`${apiRoute}/${tableName}?limit=5&offset=0`)
        .expect(200);
      
      // Get second page
      const secondPageResponse = await request(app)
        .get(`${apiRoute}/${tableName}?limit=5&offset=5`)
        .expect(200);
      
      // Verify different data is returned for different pages
      if (firstPageResponse.body.response.records.length > 0 && secondPageResponse.body.response.records.length > 0) {
        // Compare first item from each page (should be different)
        expect(firstPageResponse.body.response.records[0]).not.toEqual(secondPageResponse.body.response.records[0]);
      }
    });

    it('should handle empty results for very large offset', async () => {
      const veryLargeOffset = 10000;
      const response = await request(app)
        .get(`${apiRoute}/${tableName}?offset=${veryLargeOffset}`)
        .expect(200);
      
      // Verify empty data array but valid structure
      expect(response.body.response.records).toEqual([]);
      expect(response.body.response.pagination.hasMore).toBe(false);
    });

    it('should validate and reject invalid pagination parameters', async () => {
      // Test invalid limit (negative)
      const invalidLimitResponse = await request(app)
        .get(`${apiRoute}/${tableName}?limit=-5`)
        .expect(500);
      
      expect(invalidLimitResponse.body.success).toBe(false);
      
      // Test invalid offset (not a number)
      const invalidOffsetResponse = await request(app)
        .get(`${apiRoute}/${tableName}?offset=abc`)
        .expect(500);
      
      expect(invalidOffsetResponse.body.success).toBe(false);
    });

    it('should enforce maximum limit', async () => {
      const tooLargeLimit = 2000; // Above the 1000 maximum set in the validation
      const response = await request(app)
        .get(`${apiRoute}/${tableName}?limit=${tooLargeLimit}`)
        .expect(500);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('BigQuery direct API test', () => {
    const tableName = 'salary';
    
    it('should directly query BigQuery with pagination', async () => {
      // Test the underlying BigQuery function directly
      const limit = 5;
      const offset = 3;
      
      const result = await queryBigQuery(tableName, limit, offset);
      
      // Verify result structure
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('limit', limit);
      expect(result.pagination).toHaveProperty('offset', offset);
      expect(result.pagination).toHaveProperty('hasMore');
      
      // Verify data
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(limit);
    });
  });
  
  afterAll(async () => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
    
    // Close Redis connection if it was used
    try {
      const redis = require('../src/config/redis');
      await redis.quit();
    } catch (err) {
      console.error('Error closing Redis connection:', err);
    }
  });
});

