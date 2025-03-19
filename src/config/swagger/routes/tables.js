const tablesRoutes = {
  '/api/tables': {
    get: {
      tags: ['Tables'],
      summary: 'Get list of tables',
      description: 'Retrieves a list of all available tables from BigQuery',
      operationId: 'getTables',
      security: [
        {
          rateLimiter: []
        }
      ],
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
                  table: {
                    type: 'string',
                    example: 'tables'
                  },
                  model: {
                    type: 'string',
                    example: 'listTables'
                  },
                  response: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        table_id: {
                          type: 'string',
                          example: 'example_table'
                        }
                      }
                    }
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

module.exports = tablesRoutes;
