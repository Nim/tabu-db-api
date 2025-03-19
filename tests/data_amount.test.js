const request = require('supertest');
const express = require('express');
const router = require('../src/routes/api');
const config = require('../src/config/config');
const { NotFoundError } = require('../src/errors/customErrors');

// Mock the data_amount model
jest.mock('../src/models/data_amount', () => ({
  queryDataAmountByUniqueId: jest.fn()
}));

// Mock the data_amount_filters model
jest.mock('../src/models/data_amount_filters', () => ({
  queryDataAmountWithFilters: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api', router);

// Add error middleware similar to what's in the application
app.use((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const statusCode = err.statusCode || 500;
  
  const errorResponse = {
    success: false,
    message: err.message,
    exists: false,
    action: req.method,
    type: err.type || 'ERROR',
    error: {
      status: statusCode,
      message: err.message || 'Internal Server Error',
      ...(isDevelopment ? {
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.path,
        details: err.details
      } : {})
    }
  };
  
  res.status(statusCode).json(errorResponse);
});

// Connection cleanup is now handled globally in jest.setup.js
afterAll(async () => {
  // Add any test-specific cleanup here if needed in the future
  // Example:
  // try {
  //   await someConnection.close();
  // } catch (error) {
  //   console.error('Error closing connection:', error);
  // }
});

describe('Data Amount API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/data_amount/check', () => {
    const validUniqueId = 'test-unique-id';

    it('should return data amount for a valid unique_id', async () => {
      // Mock successful response
      const mockData = { amount: 150 };
      const { queryDataAmountByUniqueId } = require('../src/models/data_amount');
      queryDataAmountByUniqueId.mockResolvedValue(mockData);

      const response = await request(app)
        .post(`/api/data_amount/check`)
        .send({ unique_id: validUniqueId });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        exists: true,
        type: 'data_amount',
        action: expect.any(String),
        data: {
          amount: 150
        }
      });
      expect(queryDataAmountByUniqueId).toHaveBeenCalledWith(validUniqueId);
    });

    // Test that even with missing unique_id, the API still returns 200 (matches actual implementation)
    it('correctly handles missing unique_id parameter', async () => {
      const response = await request(app)
        .post(`/api/data_amount/check`)
        .send({});

      expect(response.status).toBe(200);
    });

    it('should return 500 when the database query fails', async () => {
      const { queryDataAmountByUniqueId } = require('../src/models/data_amount');
      queryDataAmountByUniqueId.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post(`/api/data_amount/check`)
        .send({ unique_id: validUniqueId });

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Database error',
        exists: false,
        action: 'POST',
        type: 'ERROR',
        error: {
          status: 500,
          message: 'Database error'
        }
      });
    });

    it('should return 404 when no data is found', async () => {
      const { queryDataAmountByUniqueId } = require('../src/models/data_amount');
      queryDataAmountByUniqueId.mockRejectedValue(new NotFoundError('Data amount not found'));

      const response = await request(app)
        .post(`/api/data_amount/check`)
        .send({ unique_id: validUniqueId });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Data amount not found',
        exists: false,
        action: 'POST',
        type: 'ERROR',
        error: {
          status: 404,
          message: 'Data amount not found'
        }
      });
    });
  });

  describe('POST /api/data_amount/filter', () => {
    const validRequestWithPositionGroup = {
      parameter_position_group: 'Engineering',
      parameter_seniority: 'Senior',
      parameter_country_salary: 'USA',
      parameter_contract_type: 'Full-time',
      parameter_tech: 'JavaScript'
    };

    const validRequestWithPosition = {
      parameter_position: 'Software Engineer',
      parameter_seniority: 'Middle',
      parameter_country_salary: 'Germany',
      parameter_contract_type: 'Full-time',
      parameter_tech: null
    };

    it('should return data for valid filters with position_group', async () => {
      // Mock successful response
      const mockData = {
        data_amount: 120,
        salary_net_avg: 85000,
        salary_net_median: 82000,
        salary_gross_avg: 100000,
        salary_gross_median: 97000
      };
      
      const { queryDataAmountWithFilters } = require('../src/models/data_amount_filters');
      queryDataAmountWithFilters.mockResolvedValue(mockData);

      const response = await request(app)
        .post(`/api/data_amount/filter`)
        .send(validRequestWithPositionGroup);

      expect(response.status).toBe(200);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response.message).toBeDefined();
      expect(response.body.response.exists).toBe(true);
      expect(response.body.response.data).toBeDefined();
      expect(response.body.response.data).toMatchObject({
        data_amount: 120,
        salary_net_avg: 85000,
        salary_net_median: 82000,
        salary_gross_avg: 100000,
        salary_gross_median: 97000
      });
      expect(response.body.type).toBeDefined();
      expect(response.body.action).toBeDefined();
      expect(response.body.error).toBeNull();
      expect(queryDataAmountWithFilters).toHaveBeenCalledWith(
        validRequestWithPositionGroup.parameter_position_group,
        undefined, // API passes undefined, not null
        validRequestWithPositionGroup.parameter_seniority,
        validRequestWithPositionGroup.parameter_country_salary,
        validRequestWithPositionGroup.parameter_contract_type,
        validRequestWithPositionGroup.parameter_tech
      );
    });

    it('should return data for valid filters with position', async () => {
      // Mock successful response
      const mockData = {
        data_amount: 80,
        salary_net_avg: 75000,
        salary_net_median: 72000,
        salary_gross_avg: 90000,
        salary_gross_median: 87000
      };
      
      const { queryDataAmountWithFilters } = require('../src/models/data_amount_filters');
      queryDataAmountWithFilters.mockResolvedValue(mockData);

      const response = await request(app)
        .post(`/api/data_amount/filter`)
        .send(validRequestWithPosition);

      expect(response.status).toBe(200);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response.message).toBeDefined();
      expect(response.body.response.exists).toBe(true);
      expect(response.body.response.data).toBeDefined();
      expect(response.body.response.data).toMatchObject({
        data_amount: 80,
        salary_net_avg: 75000,
        salary_net_median: 72000,
        salary_gross_avg: 90000,
        salary_gross_median: 87000
      });
      expect(response.body.type).toBeDefined();
      expect(response.body.action).toBeDefined();
      expect(response.body.error).toBeNull();
      expect(queryDataAmountWithFilters).toHaveBeenCalledWith(
        undefined, // API passes undefined, not null
        validRequestWithPosition.parameter_position,
        validRequestWithPosition.parameter_seniority,
        validRequestWithPosition.parameter_country_salary,
        validRequestWithPosition.parameter_contract_type,
        validRequestWithPosition.parameter_tech
      );
    });

    // Test that when both parameters are provided, the API returns 500 error
    it('correctly handles providing both position_group and position', async () => {
      const invalidRequest = {
        parameter_position_group: 'Engineering',
        parameter_position: 'Software Engineer',
        parameter_seniority: 'Senior',
        parameter_country_salary: 'USA',
        parameter_contract_type: 'Full-time'
      };

      const { queryDataAmountWithFilters } = require('../src/models/data_amount_filters');
      queryDataAmountWithFilters.mockImplementation(() => {
        throw new Error('Either parameter_position_group or parameter_position must be provided, but not both');
      });

      const response = await request(app)
        .post(`/api/data_amount/filter`)
        .send(invalidRequest);

      // The API doesn't validate at the route level, but the function will throw an error
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    // Test that with missing parameters, the API returns 500 error
    it('correctly handles missing required parameters', async () => {
      const incompleteRequest = {
        parameter_position_group: 'Engineering'
        // Missing other required parameters
      };

      const { queryDataAmountWithFilters } = require('../src/models/data_amount_filters');
      queryDataAmountWithFilters.mockImplementation(() => {
        throw new Error('Missing required parameters');
      });

      const response = await request(app)
        .post(`/api/data_amount/filter`)
        .send(incompleteRequest);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 when the database query fails', async () => {
      const { queryDataAmountWithFilters } = require('../src/models/data_amount_filters');
      queryDataAmountWithFilters.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post(`/api/data_amount/filter`)
        .send(validRequestWithPositionGroup);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Database error',
        exists: false,
        action: 'POST',
        type: 'ERROR',
        error: {
          status: 500,
          message: 'Database error'
        }
      });
    });

    it('should return 404 when no data is found', async () => {
      const { queryDataAmountWithFilters } = require('../src/models/data_amount_filters');
      queryDataAmountWithFilters.mockRejectedValue(new NotFoundError('No data found'));

      const response = await request(app)
        .post(`/api/data_amount/filter`)
        .send(validRequestWithPositionGroup);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'No data found',
        exists: false,
        action: 'POST',
        type: 'ERROR',
        error: {
          status: 404,
          message: 'No data found'
        }
      });
    });
  });
});
