const listCountrySalaryRoutes = {
  '/api/list_country_salary/check': {
    post: {
      tags: ['Lists'],
      summary: 'Check country salary list by unique ID',
      description: 'Retrieves a list of countries and their salary amounts based on the provided unique identifier',
      operationId: 'checkListCountrySalary',
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
                  description: 'Unique identifier for the country salary list'
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
                  message: {
                    type: 'string',
                    example: 'List country salary data exists'
                  },
                  exists: {
                    type: 'boolean',
                    example: true
                  },
                  method: {
                    type: 'string',
                    example: 'queryListCountrySalaryByUniqueId'
                  },
                  error: {
                    type: 'string',
                    nullable: true,
                    example: null
                  },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        country_salary: {
                          type: 'string',
                          example: 'US'
                        },
                        amount: {
                          type: 'number',
                          example: 75
                        }
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
          description: 'List country salary not found',
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
                    example: 'List country salary data not found for the provided unique_id'
                  }
                }
              }
            }
          }
        },
        '429': {
          $ref: '#/components/responses/TooManyRequests'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};

module.exports = listCountrySalaryRoutes;
