const dataAmountRoutes = {
  '/api/data_amount/check': {
    post: {
      tags: ['Data Amount'],
      summary: 'Check data amount by unique ID',
      description: 'Retrieves data amount information based on the provided unique identifier',
      operationId: 'checkDataAmount',
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
                  description: 'Unique identifier for the data amount'
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
                    example: 'Data amount exists'
                  },
                  exists: {
                    type: 'boolean',
                    example: true
                  },
                  type: {
                    type: 'string',
                    example: 'data_amount'
                  },
                  action: {
                    type: 'string',
                    example: 'POST'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      amount: {
                        type: 'number',
                        example: 150
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
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '404': {
          description: 'Data amount not found',
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
                    example: 'Data amount not found'
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
  },
  '/api/data_amount/filter': {
    post: {
      tags: ['Data Amount'],
      summary: 'Get data amount with filters',
      description: 'Retrieves data amount information based on multiple filter parameters',
      operationId: 'filterDataAmount',
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
              properties: {
                parameter_position_group: {
                  type: 'string',
                  example: 'Engineering'
                },
                parameter_position: {
                  type: 'string',
                  example: 'Software Engineer'
                },
                parameter_seniority: {
                  type: 'string',
                  example: 'Senior'
                },
                parameter_country_salary: {
                  type: 'string',
                  example: 'US'
                },
                parameter_contract_type: {
                  type: 'string',
                  example: 'Full-time'
                },
                parameter_tech: {
                  type: 'string',
                  example: 'JavaScript'
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
                        example: 'Data with filters exists'
                      },
                      exists: {
                        type: 'boolean',
                        example: true
                      },
                      data: {
                        type: 'object',
                        properties: {
                          data_amount: {
                            type: 'number',
                            example: 150
                          },
                          salary_net_avg: {
                            type: 'number',
                            example: 85000
                          },
                          salary_net_median: {
                            type: 'number',
                            example: 80000
                          },
                          salary_gross_avg: {
                            type: 'number',
                            example: 100000
                          },
                          salary_gross_median: {
                            type: 'number',
                            example: 95000
                          }
                        }
                      }
                    }
                  },
                  type: {
                    type: 'string',
                    example: 'data_amount_filters'
                  },
                  action: {
                    type: 'string',
                    example: 'POST'
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
          description: 'No data found',
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
                    example: 'No data found'
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

module.exports = dataAmountRoutes;
