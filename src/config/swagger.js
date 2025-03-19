const path = require('path');
const config = require('./config');

// Import common definitions
const schemas = require('./swagger/common/schemas');
const parameters = require('./swagger/common/parameters');
const responses = require('./swagger/common/responses');
const routes = require('./swagger/routes');

// Create the Swagger/OpenAPI definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Tabu DB API',
    version: '1.0.0',
    description: 'API documentation for TabuDB. The API implements rate limiting, CORS protection, and security headers.',
    contact: {
      name: 'TabuDB Support',
      url: config.api.websiteUrl,
      email: config.api.supportEmail
    }
  },
  servers: [{
    url: config.server.isProduction 
      ? config.api.productionUrl 
      : `http://localhost:${config.server.port}`,
    description: config.server.isProduction ? 'Production Server' : 'Development Server'
  }],
  components: {
    schemas,
    parameters,
    responses,
    securitySchemes: {
      rateLimiter: {
        type: 'apiKey',
        name: 'X-RateLimit-Limit',
        in: 'header',
        description: 'Rate limiting based on IP address. Limits API calls per time window.'
      },
      cors: {
        type: 'apiKey',
        name: 'Origin',
        in: 'header',
        description: 'CORS policy allows specific origins and methods'
      }
    }
  },
  security: [
    { rateLimiter: [] }
  ],
  tags: [
    { name: 'System', description: 'System-related operations' },
    { name: 'User', description: 'User management operations' },
    { name: 'Submission', description: 'Submission-related operations' },
    { name: 'Salary', description: 'Salary data operations' }
  ],
  paths: routes
};

module.exports = swaggerDefinition;
