const { errorResponses } = require('../common/responses');

const salaryRoutes = {
  '/api/salary/check': {
    post: {
      tags: ['Salary'],
      summary: 'Check salary information by unique ID',
      description: 'Retrieves salary information based on the provided unique identifier',
      operationId: 'checkSalary',
      security: [
        {
          rateLimiter: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['unique_id'],
              properties: {
                unique_id: {
                  type: 'string',
                  description: 'Unique identifier for the salary record'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'object',
                    properties: {
                      salary: {
                        type: 'number',
                        description: 'Salary amount'
                      },
                      currency: {
                        type: 'string',
                        description: 'Currency code'
                      },
                      position: {
                        type: 'string',
                        description: 'Job position'
                      },
                      experience: {
                        type: 'number',
                        description: 'Years of experience'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '404': {
          $ref: '#/components/responses/NotFound'
        },
        '429': {
          description: 'Too Many Requests',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Too many requests, please try again later.'
                  }
                }
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};

module.exports = salaryRoutes;
