const listContractTypeRoutes = {
  '/api/list_contract_type/check': {
    post: {
      tags: ['Lists'],
      summary: 'Check contract type list by unique ID',
      description: 'Retrieves a list of contract types and their amounts based on the provided unique identifier',
      operationId: 'checkListContractType',
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
                  description: 'Unique identifier for the contract type list'
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
                    example: 'List Contract type data exists'
                  },
                  exists: {
                    type: 'boolean',
                    example: true
                  },
                  method: {
                    type: 'string',
                    example: 'queryListContractTypeByUniqueId'
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
                        contract_type: {
                          type: 'string',
                          example: 'Full-time'
                        },
                        amount: {
                          type: 'number',
                          example: 42
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
          description: 'List Contract type not found',
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
                    example: 'List Contract type data not found for the provided unique_id'
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

module.exports = listContractTypeRoutes;
