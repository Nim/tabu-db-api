const submissionRoutes = {
  '/api/submission/check': {
    post: {
      tags: ['Submission'],
      summary: 'Check submission data by unique ID',
      description: 'Retrieves submission information based on the provided unique identifier',
      operationId: 'checkSubmission',
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
                  description: 'Unique identifier for the submission'
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
                        example: 'Submission found'
                      },
                      exists: {
                        type: 'boolean',
                        example: true
                      },
                      position_group: {
                        type: 'string',
                        example: 'Engineering'
                      },
                      position: {
                        type: 'string',
                        example: 'Software Engineer'
                      },
                      seniority: {
                        type: 'string',
                        example: 'Senior'
                      },
                      tech: {
                        type: 'array',
                        items: {
                          type: 'string'
                        },
                        example: ['JavaScript', 'Node.js']
                      },
                      contract_type: {
                        type: 'string',
                        example: 'Full-time'
                      },
                      country_salary: {
                        type: 'string',
                        example: 'US'
                      }
                    }
                  },
                  action: {
                    type: 'string',
                    example: 'getSubmissionByUniqueId'
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
          description: 'Submission not found',
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
                    example: 'Submission data not found for the provided unique_id'
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

module.exports = submissionRoutes;
