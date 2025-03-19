const swaggerRoutes = {
  '/swagger/json': {
    get: {
      tags: ['Documentation'],
      summary: 'Swagger JSON',
      description: 'Get the Swagger specification in JSON format',
      operationId: 'getSwaggerJson',
      responses: {
        '200': {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'The Swagger/OpenAPI specification'
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  '/swagger': {
    get: {
      tags: ['Documentation'],
      summary: 'Swagger UI',
      description: 'Get the Swagger UI documentation page',
      operationId: 'getSwaggerUI',
      responses: {
        '200': {
          description: 'Successful operation',
          content: {
            'text/html': {
              schema: {
                type: 'string',
                description: 'HTML content of Swagger UI'
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

module.exports = swaggerRoutes;

