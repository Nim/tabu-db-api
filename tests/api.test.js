const request = require('supertest');
const config = require('../src/config/config');
const createApp = require('../src/app');
const apiRoute = config.server.apiRoute;

// Set environment to test
process.env.NODE_ENV = 'test';

// Mock all required models
jest.mock('../src/models/list_tech', () => ({
  queryListTechByUniqueId: jest.fn()
}));

jest.mock('../src/models/list_country_salary', () => ({
  queryListCountrySalaryByUniqueId: jest.fn()
}));

jest.mock('../src/models/submission', () => ({
  querySubmissionByUniqueId: jest.fn()
}));

jest.mock('../src/models/user', () => ({
  queryUserTable: jest.fn(),
  queryUserByEmail: jest.fn()
}));

jest.mock('../src/models/bigQuery', () => ({
  listTables: jest.fn().mockResolvedValue(['table1', 'table2']),
  queryBigQuery: jest.fn().mockResolvedValue([{ data: 'test' }])
}));

// Mock list_contract_type module
jest.mock('../src/models/list_contract_type', () => ({
  queryListContractTypeByUniqueId: jest.fn()
}));

// Create the app using the createApp function
const app = createApp();

// Create a server to properly close it later
const server = app.listen(0);

// Register server for cleanup in jest's global registry
if (!global.__TEST_SERVERS__) {
  global.__TEST_SERVERS__ = [];
}
global.__TEST_SERVERS__.push(server);

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tables', async () => {
    const response = await request(app).get(`${apiRoute}/tables`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should fetch user data', async () => {
    const response = await request(app).get(`${apiRoute}/user`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should check user email', async () => {
    const response = await request(app)
      .post(`${apiRoute}/user/check`)
      .send({
        email: config.server.testEmail,
        isGoogleLogin: true,
        name: 'Test User'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should check list tech data', async () => {
    const mockData = [
      { unique_id: config.server.testUniqueId, tech: '.NET / C#', amount: 8 },
      { unique_id: config.server.testUniqueId, tech: 'Java', amount: 2 },
      { unique_id: config.server.testUniqueId, tech: 'Symfony', amount: 1 }
    ];

    const { queryListTechByUniqueId } = require('../src/models/list_tech');
    queryListTechByUniqueId.mockResolvedValue(mockData);

    const response = await request(app)
      .post(`${apiRoute}/list_tech/check`)
      .send({ unique_id: config.server.testUniqueId });

    

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toMatchObject({
      success: true,
      message: expect.any(String),
      exists: true,
      method: 'queryListTechByUniqueId',
      data: expect.any(Array)
    });
    expect(response.body.data.length).toBeGreaterThan(1);
  });

  it('should check list country salary data', async () => {
    const mockData = [
      { unique_id: config.server.testUniqueId, country: 'USA', salary_range: '100k-150k' },
      { unique_id: config.server.testUniqueId, country: 'Canada', salary_range: '90k-130k' }
    ];

    const { queryListCountrySalaryByUniqueId } = require('../src/models/list_country_salary');
    queryListCountrySalaryByUniqueId.mockResolvedValue(mockData);

    const response = await request(app)
      .post(`${apiRoute}/list_country_salary/check`)
      .send({ unique_id: config.server.testUniqueId });

    

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toMatchObject({
      success: true,
      message: expect.any(String),
      exists: true,
      method: 'queryListCountrySalaryByUniqueId',
      data: expect.any(Array)
    });
    expect(response.body.data.length).toBeGreaterThan(1);
  });

  it('should check submission data', async () => {
    const mockData = {
      unique_id: config.server.testUniqueId,
      position_group: 'Engineering',
      position: 'Developer',
      seniority: 'Senior',
      tech: 'JavaScript',
      contract_type: 'Full-time',
      country_salary: 'USA'
    };

    const { querySubmissionByUniqueId } = require('../src/models/submission');
    querySubmissionByUniqueId.mockResolvedValue(mockData);

    const response = await request(app)
      .post(`${apiRoute}/submission/check`)
      .send({ unique_id: config.server.testUniqueId });

    

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toMatchObject({
      success: true,
      response: {
        message: expect.any(String),
        exists: true,
        position_group: 'Engineering',
        position: 'Developer',
        seniority: 'Senior',
        tech: 'JavaScript',
        contract_type: 'Full-time',
        country_salary: 'USA'
      },
      action: 'querySubmissionByUniqueId',
      error: null
    });
  });

  it('should check additional position data', async () => {
    const response = await request(app)
      .post(`${apiRoute}/additional_position/check`)
      .send({ unique_id: config.server.testUniqueId });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should fetch data from a specific table', async () => {
    const response = await request(app).get(`${apiRoute}/salary`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should check list contract type data', async () => {
    const mockData = [
      { unique_id: config.server.testUniqueId, contract_type: 'Full-time', amount: 5 },
      { unique_id: config.server.testUniqueId, contract_type: 'Part-time', amount: 3 },
      { unique_id: config.server.testUniqueId, contract_type: 'Freelance', amount: 2 }
    ];

    const { queryListContractTypeByUniqueId } = require('../src/models/list_contract_type');
    queryListContractTypeByUniqueId.mockResolvedValue(mockData);

    const response = await request(app)
      .post(`${apiRoute}/list_contract_type/check`)
      .send({ unique_id: config.server.testUniqueId });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toMatchObject({
      success: true,
      message: expect.any(String),
      exists: true,
      method: 'queryListContractTypeByUniqueId',
      data: expect.any(Array)
    });
    expect(response.body.data.length).toBeGreaterThan(1);
  });

  afterAll(async () => {
    // Close Redis connection
    const redis = require('../src/config/redis');
    try {
      if (redis.isReady) {
        await redis.quit();
      }
    } catch (error) {
      console.warn('Error closing Redis connection:', error.message);
    }
    
    // Reset environment variable
    delete process.env.NODE_ENV;

    // Close Express server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });
});
