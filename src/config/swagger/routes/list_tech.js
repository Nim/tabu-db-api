const listTechRoutes = {
  '/api/list_tech/check': {
    post: {
      tags: ['Lists'],
      summary: 'Check technology list by unique ID',
      description: 'Retrieves a list of technologies and their amounts based on the provided unique identifier',
      operationId: 'checkListTech',
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
                  description: 'Unique identifier for the technology list'
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
                    example: 'List tech data exists'
                  },
                  exists: {
                    type: 'boolean',
                    example: true
                  },
                  method: {
                    type: 'string',
                    example: 'queryListTechByUniqueId'
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
                        tech: {
                          type: 'string',
                          example: 'JavaScript'
                        },
                        amount: {
                          type: 'number',
                          example: 150
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
          description: 'List tech not found',
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
                    example: 'List tech data not found for the provided unique_id'
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

module.exports = listTechRoutes;
