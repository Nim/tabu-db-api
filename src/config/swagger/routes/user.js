const { responses } = require('../common/responses');

module.exports = {
  '/api/user': {
    get: {
      tags: ['User'],
      summary: 'Get user information',
      description: 'Retrieve user information from the user table',
      responses: {
        '200': {
          description: 'Success',
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
                    example: 'user'
                  },
                  action: {
                    type: 'string',
                    example: 'queryUserTable'
                  },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object'
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
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  },
  '/api/user/check': {
    post: {
      tags: ['User'],
      summary: 'Check user existence',
      description: 'Check if a user exists by email, with additional Google login support',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  example: 'user@example.com'
                },
                isGoogleLogin: {
                  type: 'boolean',
                  example: false
                },
                name: {
                  type: 'string',
                  example: 'John Doe'
                }
              },
              required: ['email']
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Success',
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
                    example: 'User email exists'
                  },
                  exists: {
                    type: 'boolean',
                    example: true
                  },
                  action: {
                    type: 'string',
                    example: 'queryUserByEmail'
                  },
                  name: {
                    type: 'string',
                    nullable: true,
                    example: 'John Doe'
                  },
                  unique_id: {
                    type: 'string',
                    nullable: true,
                    example: 'user123'
                  }
                }
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '500': {
          $ref: '#/components/responses/ServerError'
        }
      }
    }
  }
};
