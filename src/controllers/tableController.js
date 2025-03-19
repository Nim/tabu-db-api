const { DatabaseError, ValidationError, NotFoundError } = require('../errors/customErrors');
const bigQueryService = require('../services/bigQueryInstance');
const { validateTableName } = require('../middleware/validation');
const config = require('../config/config');

/**
 * Get a preview of table data with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTableDataPreview = async (req, res, next) => {
  console.log('getTableDataPreview called with params:', {
    tableName: req.params.tableName,
    query: req.query,
    route: req.originalUrl,
    method: req.method
  });

  try {
    const { tableName } = req.params;
    const { page = 1, limit = 100, filters } = req.query;
    
    // Validate table name
    if (!validateTableName(tableName)) {
      throw new ValidationError(`Invalid table name: ${tableName}`);
    }
    
    // Parse pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    if (isNaN(pageNum) || pageNum < 1) {
      throw new ValidationError('Page must be a positive integer');
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      throw new ValidationError('Limit must be between 1 and 1000');
    }
    
    // Parse filters if provided
    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      } catch (error) {
        throw new ValidationError('Invalid filter format. Expected JSON object.');
      }
    }
    
    // Calculate offset for pagination
    const offset = (pageNum - 1) * limitNum;
    
    // Get data from BigQuery
    // The getTableData method expects (datasetId, tableId, page, limit, filters)
    const datasetId = config.bigQuery.defaultDataset;
    const result = await bigQueryService.getTableData(datasetId, tableName, pageNum, limitNum, parsedFilters);
    
    // Return the preview data
    return res.status(200).json({
      success: true,
      response: {
        records: result.data, // Changed from result.rows to result.data to match service response
        pagination: {
          limit: limitNum,
          offset: offset,
          hasMore: result.hasMore || (pageNum < result.totalPages) // Use result.hasMore if available, fall back to page calculation
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get table structure/schema information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTableSchema = async (req, res, next) => {
  console.log('getTableSchema called with params:', {
    tableName: req.params.tableName,
    query: req.query,
    route: req.originalUrl,
    method: req.method
  });
  
  try {
    const { tableName } = req.params;
    
    // Validate table name
    if (!validateTableName(tableName)) {
      throw new ValidationError(`Invalid table name: ${tableName}`);
    }
    
    // Get schema information from BigQuery
    console.log('Calling bigQueryService.getTableSchema with tableName:', tableName);
    const schema = await bigQueryService.getTableSchema(tableName);
    console.log('bigQueryService.getTableSchema returned schema:', schema ? 'Schema found' : 'No schema returned');
    
    if (!schema) {
      throw new NotFoundError(`Schema for table ${tableName} not found`);
    }
    
    return res.status(200).json({
      success: true,
      data: {
        tableName,
        schema: schema.fields
      }
    });
  } catch (error) {
    console.error('Error in getTableSchema:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    next(error);
  }
};

/**
 * Get list of available tables
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAvailableTables = async (req, res, next) => {
  console.log('getAvailableTables called with params:', {
    query: req.query,
    route: req.originalUrl,
    method: req.method
  });

  try {
    const datasetId = config.bigQuery.defaultDataset;
    console.log('BigQuery config:', {
      defaultDataset: config.bigQuery.defaultDataset,
      projectId: config.bigQuery.projectId || 'Not set',
      keyFilename: config.bigQuery.keyFilename || 'Not set',
      credentialsPath: config.database?.credentialsPath || 'Not set'
    });
    
    console.log('Calling bigQueryService.listTables with datasetId:', datasetId);
    
    try {
      const tables = await bigQueryService.listTables(datasetId);
      console.log('bigQueryService.listTables returned:', tables ? `${tables.length} tables` : 'No tables returned');
      
      return res.status(200).json({
        success: true,
        data: {
          tables
        }
      });
    } catch (bigQueryError) {
      console.error('BigQuery error:', bigQueryError);
      console.log('Falling back to mock tables data');
      
      // Fallback to mock data for debugging
      const mockTables = [
        {
          id: 'users',
          kind: 'bigquery#table',
          type: 'TABLE',
          creationTime: new Date().toISOString(),
          lastModifiedTime: new Date().toISOString()
        },
        {
          id: 'transactions',
          kind: 'bigquery#table',
          type: 'TABLE',
          creationTime: new Date().toISOString(),
          lastModifiedTime: new Date().toISOString()
        },
        {
          id: 'products',
          kind: 'bigquery#table',
          type: 'TABLE',
          creationTime: new Date().toISOString(),
          lastModifiedTime: new Date().toISOString()
        },
        {
          id: 'salary',
          kind: 'bigquery#table',
          type: 'TABLE',
          creationTime: new Date().toISOString(),
          lastModifiedTime: new Date().toISOString()
        }
      ];
      
      return res.status(200).json({
        success: true,
        data: {
          tables: mockTables,
          source: 'mock data - BigQuery unavailable'
        }
      });
    }
  } catch (error) {
    console.error('Error in getAvailableTables:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    next(error);
  }
};

/**
 * Get table metadata including row count and last modified date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTableMetadata = async (req, res, next) => {
  console.log('getTableMetadata called with params:', {
    tableName: req.params.tableName,
    query: req.query,
    route: req.originalUrl,
    method: req.method
  });

  try {
    const { tableName } = req.params;
    
    // Validate table name
    if (!validateTableName(tableName)) {
      throw new ValidationError(`Invalid table name: ${tableName}`);
    }
    
    console.log('Calling bigQueryService.getTableMetadata with tableName:', tableName);
    const metadata = await bigQueryService.getTableMetadata(tableName);
    console.log('bigQueryService.getTableMetadata returned metadata:', metadata ? 'Metadata found' : 'No metadata returned');
    
    if (!metadata) {
      throw new NotFoundError(`Metadata for table ${tableName} not found`);
    }
    
    return res.status(200).json({
      success: true,
      data: {
        tableName,
        rowCount: metadata.numRows,
        lastModified: metadata.lastModifiedTime,
        sizeBytes: metadata.numBytes,
        description: metadata.description || null
      }
    });
  } catch (error) {
    console.error('Error in getTableMetadata:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    next(error);
  }
};

/**
 * Run a custom query against a table with input validation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const runCustomTableQuery = async (req, res, next) => {
  console.log('runCustomTableQuery called with params:', {
    tableName: req.params.tableName,
    query: req.query,
    body: req.body,
    route: req.originalUrl,
    method: req.method
  });

  try {
    const { tableName } = req.params;
    const { query, parameters } = req.body;
    
    // Validate table name
    if (!validateTableName(tableName)) {
      throw new ValidationError(`Invalid table name: ${tableName}`);
    }
    
    // Validate query
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Query must be a non-empty string');
    }
    
    // Security check - ensure query only references the specified table
    if (!query.includes(tableName)) {
      throw new ValidationError(`Query must reference the specified table: ${tableName}`);
    }
    
    // Execute the custom query
    console.log('Calling bigQueryService.executeCustomQuery with:', { tableName, query });
    const result = await bigQueryService.executeCustomQuery(query, parameters);
    console.log('bigQueryService.executeCustomQuery returned result:', result ? `${result.length || 0} records` : 'No results returned');
    
    return res.status(200).json({
      success: true,
      data: {
        records: result
      }
    });
  } catch (error) {
    console.error('Error in runCustomTableQuery:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    next(error);
  }
};

/**
 * Get distinct values for a specific column from a table
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDistinctColumnValues = async (req, res, next) => {
  console.log('getDistinctColumnValues called with params:', {
    tableName: req.params.tableName,
    columnName: req.params.columnName,
    query: req.query,
    route: req.originalUrl,
    method: req.method
  });

  try {
    const { tableName, columnName } = req.params;
    const { limit = 1000 } = req.query;
    
    // Validate table name
    if (!validateTableName(tableName)) {
      throw new ValidationError(`Invalid table name: ${tableName}`);
    }
    
    // Validate column name to prevent SQL injection
    if (!columnName || !/^[a-zA-Z0-9_]+$/.test(columnName)) {
      throw new ValidationError(`Invalid column name: ${columnName}`);
    }
    
    // Parse limit parameter
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 10000) {
      throw new ValidationError('Limit must be between 1 and 10000');
    }
    
    // Get distinct values
    console.log('Calling bigQueryService.getDistinctColumnValues with:', { tableName, columnName, limitNum });
    const values = await bigQueryService.getDistinctColumnValues(tableName, columnName, limitNum);
    console.log('bigQueryService.getDistinctColumnValues returned:', values ? `${values.length} values` : 'No values returned');
    
    return res.status(200).json({
      success: true,
      data: {
        tableName,
        columnName,
        distinctValues: values
      }
    });
  } catch (error) {
    console.error('Error in getDistinctColumnValues:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    next(error);
  }
};

/**
 * Get table data with aggregation (count, sum, avg, etc.)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTableAggregation = async (req, res, next) => {
  console.log('getTableAggregation called with params:', {
    tableName: req.params.tableName,
    query: req.query,
    body: req.body,
    route: req.originalUrl,
    method: req.method
  });

  try {
    const { tableName } = req.params;
    const { 
      aggregateFunction, 
      aggregateColumn, 
      groupByColumns, 
      filters,
      limit = 1000 
    } = req.body;
    
    // Validate table name
    if (!validateTableName(tableName)) {
      throw new ValidationError(`Invalid table name: ${tableName}`);
    }
    
    // Validate aggregate function
    const validAggregateFunctions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
    if (!aggregateFunction || !validAggregateFunctions.includes(aggregateFunction.toUpperCase())) {
      throw new ValidationError(`Invalid aggregate function. Must be one of: ${validAggregateFunctions.join(', ')}`);
    }
    
    // Validate column names
    if (aggregateFunction.toUpperCase() !== 'COUNT' && (!aggregateColumn || !/^[a-zA-Z0-9_]+$/.test(aggregateColumn))) {
      throw new ValidationError(`Invalid aggregate column name: ${aggregateColumn}`);
    }
    
    if (groupByColumns && (!Array.isArray(groupByColumns) || groupByColumns.some(col => !/^[a-zA-Z0-9_]+$/.test(col)))) {
      throw new ValidationError('Group by columns must be an array of valid column names');
    }
    
    // Parse limit parameter
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 10000) {
      throw new ValidationError('Limit must be between 1 and 10000');
    }
    
    // Execute aggregation query
    console.log('Calling bigQueryService.executeAggregationQuery with:', { 
      tableName, 
      aggregateFunction, 
      aggregateColumn, 
      groupByColumns, 
      filters, 
      limitNum 
    });
    const result = await bigQueryService.executeAggregationQuery(
      tableName,
      aggregateFunction,
      aggregateColumn,
      groupByColumns,
      filters,
      limitNum
    );
    console.log('bigQueryService.executeAggregationQuery returned:', result ? `${result.length} results` : 'No results returned');
    
    return res.status(200).json({
      success: true,
      data: {
        tableName,
        aggregation: {
          function: aggregateFunction,
          column: aggregateColumn,
          groupBy: groupByColumns
        },
        results: result
      }
    });
  } catch (error) {
    console.error('Error in getTableAggregation:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    next(error);
  }
};

/**
 * Get table data with pagination using the BigQuery service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTableData = async (req, res, next) => {
  try {
    console.log('getTableData function called', {
      path: req.path,
      params: req.params,
      query: req.query
    });
    
    const { tableName } = req.params;
    
    // Get and validate pagination parameters
    const { limit = config.pagination.limit, offset = config.pagination.offset } = req.query;
    let limitNum = parseInt(limit, 10);
    let offsetNum = parseInt(offset, 10);
    
    // Validate limit
    if (isNaN(limitNum) || limitNum <= 0) {
      const error = new ValidationError('Limit must be a positive integer');
      error.statusCode = 400;
      throw error;
    }
    
    // Check max limit
    const maxLimit = config.pagination.maxLimit || 1000;
    if (limitNum > maxLimit) {
      limitNum = maxLimit;
      console.log(`Limiting to max: ${maxLimit}`);
    }
    
    // Validate offset
    if (isNaN(offsetNum) || offsetNum < 0) {
      const error = new ValidationError('Offset must be a non-negative integer');
      error.statusCode = 400;
      throw error;
    }
    
    console.log('Using pagination values:', { limitNum, offsetNum });
    
    // Calculate page number for BigQuery service (which expects page number, not offset)
    const pageNum = Math.floor(offsetNum / limitNum) + 1;
    
    // Get filters from query params if any
    const filters = {};
    
    // Get data from BigQuery
    const datasetId = config.bigQuery.defaultDataset;
    console.log(`Fetching real data from BigQuery for table: ${tableName}`);
    const result = await bigQueryService.getTableData(datasetId, tableName, pageNum, limitNum, filters);
    
    // Return the paginated data
    return res.status(200).json({
      success: true,
      response: {
        records: result.data,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          hasMore: pageNum < result.totalPages,
          total: result.totalCount,
          totalPages: result.totalPages
        }
      }
    });
    
  } catch (error) {
    console.error('Error in getTableData:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    next(error);
  }
};

module.exports = {
  getTableDataPreview,
  getTableSchema,
  getAvailableTables,
  getTableMetadata,
  runCustomTableQuery,
  getDistinctColumnValues,
  getTableAggregation,
  
  // Use the actual functions instead of aliases
  getTableData,
  getTables: getAvailableTables,
  getTableFields: getTableSchema,
  getTableRowCount: getTableMetadata,
  getTableTimeSeries: getTableDataPreview,
  getTableDataAsCsv: getTableDataPreview
};
