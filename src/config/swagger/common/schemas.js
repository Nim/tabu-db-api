const commonSchemas = {
  Error: {
    type: 'object',
    properties: {
      code: {
        type: 'integer',
        format: 'int32',
        example: 400
      },
      message: {
        type: 'string',
        example: 'Bad Request'
      }
    }
  },
  Pagination: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20
      },
      total: {
        type: 'integer'
      }
    }
  },
  Success: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Operation completed successfully'
      }
    }
  }
};

module.exports = commonSchemas;

