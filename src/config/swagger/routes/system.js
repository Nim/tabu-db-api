const systemRoutes = {
  '/api/system/cache-stats': {
    get: {
      tags: ['System'],
      summary: 'Get cache statistics',
      description: 'Retrieves current cache statistics and metrics',
      operationId: 'getCacheStats',
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
                        example: 'Cache statistics retrieved successfully'
                      },
                      stats: {
                        type: 'object',
                        properties: {
                          hits: {
                            type: 'number',
                            example: 150
                          },
                          misses: {
                            type: 'number',
                            example: 50
                          },
                          keys: {
                            type: 'number',
                            example: 200
                          }
                        }
                      }
                    }
                  },
                  action: {
                    type: 'string',
                    example: 'getCacheStats'
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
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};

module.exports = systemRoutes;
