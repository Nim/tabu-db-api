const additionalPositionRoutes = {
  '/api/additional_position/check': {
    post: {
      tags: ['Additional Position'],
      summary: 'Check additional position by unique ID',
      description: 'Retrieves additional position information based on the provided unique identifier',
      operationId: 'checkAdditionalPosition',
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
                  description: 'Unique identifier for the additional position'
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
                  response: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Additional position data exists'
                      },
                      exists: {
                        type: 'boolean',
                        example: true
                      },
                      additional_position_group: {
                        type: 'string',
                        example: 'Engineering'
                      },
                      additional_position: {
                        type: 'string',
                        example: 'Software Engineer'
                      }
                    }
                  },
                  action: {
                    type: 'string',
                    example: 'queryAdditionalPositionByUniqueId'
                  },
                  error: {
                    type: 'string',
                    nullable: true,
                    example: null
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
          description: 'Additional position not found',
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
                    example: 'Additional position data not found for the provided unique_id'
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

module.exports = additionalPositionRoutes;
