const commonParameters = {
  pagination: [
    {
      name: 'page',
      in: 'query',
      schema: {
        type: 'integer',
        minimum: 1,
        default: 1
      },
      description: 'Page number'
    },
    {
      name: 'limit',
      in: 'query',
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20
      },
      description: 'Items per page'
    }
  ],
  tableId: {
    name: 'tableId',
    in: 'path',
    required: true,
    schema: {
      type: 'string'
    },
    description: 'Table identifier'
  }
};

module.exports = commonParameters;
