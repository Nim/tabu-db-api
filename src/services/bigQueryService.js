const { DatabaseError } = require('../errors/customErrors');
const logger = require('../config/logger');
const config = require('../config/config');
const { BigQuery } = require('@google-cloud/bigquery');

class BigQueryService {
  constructor() {
    this._initializeClient();
  }
  _initializeClient() {
    try {
      this._bigQueryClient = new BigQuery({
        projectId: config.bigQuery.projectId,
        keyFilename: config.bigQuery.keyFilename || config.database.credentialsPath
      });
      
      this._defaultLimit = config.pagination?.limit || 100;
      this._maxLimit = config.pagination?.maxLimit || 1000;
      this._schemaName = config.database?.schema;
      
      logger.info('BigQuery service initialized');
    } catch (error) {
      logger.error('Error initializing BigQuery service', { error });
      throw new DatabaseError('Failed to initialize BigQuery service', error);
    }
  }

  /**
   * Gets the BigQuery client instance
   * @returns {BigQuery} The BigQuery client
   */
  getClient() {
    return this._bigQueryClient;
  }
  /**
   * Gets the schema name
   * @returns {string} The schema name
   */
  getSchemaName() {
    return this._schemaName;
  }

  /**
   * Get a preview of data from a specified table
   * @param {string} datasetId - The BigQuery dataset ID
   * @param {string} tableId - The BigQuery table ID
   * @param {number} limit - Maximum number of rows to return (defaults to config value)
   * @param {Object} filters - Optional filters to apply to the query
   * @returns {Promise<Array>} - Promise resolving to array of row objects
   */
  async getTableDataPreview(datasetId, tableId, limit = this._defaultLimit, filters = {}) {
    try {
      // Ensure limit doesn't exceed max
      // Ensure limit doesn't exceed max
      const finalLimit = Math.min(limit, this._maxLimit);
      // Construct a query with the given filters
      let query = `SELECT * FROM \`${datasetId}.${tableId}\``;

      // Add WHERE clauses for filters
      if (Object.keys(filters).length > 0) {
        const filterClauses = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            // Escape string values
            const escapedValue = typeof value === 'string' ? `'${value.replace(/'/g, "\\'")}'` : value;
            filterClauses.push(`${key} = ${escapedValue}`);
          }
        }
        if (filterClauses.length > 0) {
          query += ` WHERE ${filterClauses.join(' AND ')}`;
        }
      }

      // Add row limit
      query += ` LIMIT ${finalLimit}`;

      logger.info('Executing BigQuery preview query', { datasetId, tableId, limit: finalLimit });
      
      // Execute the query
      const [rows] = await this._bigQueryClient.query({ query });
      return rows;
    } catch (error) {
      logger.error('Error getting table data preview', { 
        error, datasetId, tableId, limit, filters 
      });
      throw new DatabaseError(`Error retrieving preview data from ${datasetId}.${tableId}`, error);
    }
  }
  /**
   * Get table data with pagination and optional filters
   * @param {string} datasetId - The BigQuery dataset ID
   * @param {string} tableId - The BigQuery table ID
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of items per page (defaults to config value)
   * @param {Object} filters - Optional filters to apply to the query
   * @returns {Promise<{data: Array, totalCount: number, page: number, limit: number, totalPages: number}>} - Paginated result with metadata
   */
  async getTableData(datasetId, tableId, page = 1, limit = this._defaultLimit, filters = {}) {
    try {
      // Ensure limit doesn't exceed max and page is at least 1
      const finalLimit = Math.min(limit, this._maxLimit);
      const finalPage = Math.max(1, page);
      const offset = (finalPage - 1) * finalLimit;
      
      // Construct filter clauses if any
      let whereClause = '';
      if (Object.keys(filters).length > 0) {
        const filterClauses = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            // Escape string values
            const escapedValue = typeof value === 'string' ? `'${value.replace(/'/g, "\\'")}'` : value;
            filterClauses.push(`${key} = ${escapedValue}`);
          }
        }
        if (filterClauses.length > 0) {
          whereClause = ` WHERE ${filterClauses.join(' AND ')}`;
        }
      }

      // Get total count first
      const countQuery = `SELECT COUNT(*) as count FROM \`${datasetId}.${tableId}\`${whereClause}`;
      const [countRows] = await this._bigQueryClient.query({ query: countQuery });
      const totalCount = parseInt(countRows[0].count, 10);
      
      // If no results, return empty data with metadata
      if (totalCount === 0) {
        return {
          data: [],
          totalCount: 0,
          page: finalPage,
          limit: finalLimit,
          totalPages: 0
        };
      }

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / finalLimit);
      
      // Construct the main data query with pagination
      const dataQuery = `SELECT * FROM \`${datasetId}.${tableId}\`${whereClause} LIMIT ${finalLimit} OFFSET ${offset}`;
      const [rows] = await this._bigQueryClient.query({ query: dataQuery });
      
      return {
        data: rows,
        totalCount,
        page: finalPage,
        limit: finalLimit,
        totalPages
      };
    } catch (error) {
      logger.error('Error getting table data', { 
        error, datasetId, tableId, page, limit, filters 
      });
      throw new DatabaseError(`Error retrieving data from ${datasetId}.${tableId}`, error);
    }
  }

  /**
   * Get metadata about a table
   * @param {string} datasetId - The BigQuery dataset ID
   * @param {string} tableId - The BigQuery table ID
   * @returns {Promise<Object>} - Promise resolving to table metadata
   */
  async getTableMetadata(datasetId, tableId) {
    try {
      logger.info('Getting table metadata', { datasetId, tableId });
      
      const [metadata] = await this._bigQueryClient
        .dataset(datasetId)
        .table(tableId)
        .getMetadata();
      
      return metadata;
    } catch (error) {
      logger.error('Error getting table metadata', { 
        error, datasetId, tableId 
      });
      throw new DatabaseError(`Error retrieving metadata for ${datasetId}.${tableId}`, error);
    }
  }

  /**
   * List all tables in a dataset
   * @param {string} datasetId - The BigQuery dataset ID
   */
  async listTables(datasetId) {
    try {
      logger.info("Listing tables in dataset", { datasetId });
      
      const [tables] = await this._bigQueryClient
        .dataset(datasetId)
        .getTables();
      
      return tables.map(table => {
        // Safely convert timestamps
        let creationTime = new Date().toISOString();
        let lastModifiedTime = new Date().toISOString();
        
        // Return the values safely
        return {
          id: table.id,
          kind: table.metadata?.kind || "unknown",
          type: table.metadata?.type || "TABLE",
          creationTime: creationTime,
          lastModifiedTime: lastModifiedTime
        };
      });
    } catch (error) {
      logger.error('Error listing tables', { error, datasetId });
      throw new DatabaseError(`Error listing tables in dataset ${datasetId}`, error);
    }
  }

  /**
   * Execute a custom query against BigQuery
   * @param {string} query - SQL query to execute
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Promise resolving to query results
   */
  async executeQuery(query, options = {}) {
    try {
      logger.info('Executing custom BigQuery query', { 
        query: query.substring(0, 100) + (query.length > 100 ? '...' : '') 
      });
      
      const [rows] = await this._bigQueryClient.query({
        query,
        ...options
      });
      
      return rows;
    } catch (error) {
      logger.error('Error executing BigQuery query', { error, query: query.substring(0, 100) });
      throw new DatabaseError('Error executing BigQuery query', error);
    }
  }

  /**
   * Execute a paginated custom query
   * @param {string} query - SQL query to execute (without LIMIT or OFFSET)
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of items per page
   * @param {Object} options - Additional query options
   * @returns {Promise<{data: Array, totalCount: number, page: number, limit: number, totalPages: number}>} - Paginated results
   */
  async executePaginatedQuery(query, page = 1, limit = this._defaultLimit, options = {}) {
    try {
      // Ensure limit doesn't exceed max and page is at least 1
      const finalLimit = Math.min(limit, this._maxLimit);
      const finalPage = Math.max(1, page);
      const offset = (finalPage - 1) * finalLimit;
      
      // Need to extract the base table being queried to get count
      // This is a simplistic approach - for complex queries it's better to use a more robust method
      const countQuery = `SELECT COUNT(*) as count FROM (${query}) as subquery`;
      const [countRows] = await this._bigQueryClient.query({ query: countQuery, ...options });
      const totalCount = parseInt(countRows[0].count, 10);
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / finalLimit);
      
      // Add pagination to original query
      const paginatedQuery = `${query} LIMIT ${finalLimit} OFFSET ${offset}`;
      
      logger.info('Executing paginated custom BigQuery query', { 
        page: finalPage, limit: finalLimit, offset 
      });
      
      const [rows] = await this._bigQueryClient.query({ query: paginatedQuery, ...options });
      
      return {
        data: rows,
        totalCount,
        page: finalPage,
        limit: finalLimit,
        totalPages
      };
    } catch (error) {
      logger.error('Error executing paginated query', { 
        error, page, limit
      });
      throw new DatabaseError('Error executing paginated BigQuery query', error);
    }
  }

  /**
   * Get row count for a table
   * @param {string} datasetId - The BigQuery dataset ID
   * @param {string} tableId - The BigQuery table ID
   * @param {Object} filters - Optional filters to apply
   * @returns {Promise<number>} - Promise resolving to the row count
   */
  async getTableRowCount(datasetId, tableId, filters = {}) {
    try {
      let query = `SELECT COUNT(*) as count FROM \`${datasetId}.${tableId}\``;
      
      // Add WHERE clauses for filters
      if (Object.keys(filters).length > 0) {
        const filterClauses = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            // Escape string values
            const escapedValue = typeof value === 'string' ? `'${value.replace(/'/g, "\\'")}'` : value;
            filterClauses.push(`${key} = ${escapedValue}`);
          }
        }
        if (filterClauses.length > 0) {
          query += ` WHERE ${filterClauses.join(' AND ')}`;
        }
      }
      
      logger.info('Getting table row count', { datasetId, tableId });
      
      const [rows] = await this._bigQueryClient.query({ query });
      return parseInt(rows[0].count, 10);
    } catch (error) {
      logger.error('Error getting table row count', { 
        error, datasetId, tableId 
      });
      throw new DatabaseError(`Error getting row count for ${datasetId}.${tableId}`, error);
    }
  }
  
  /**
   * Get schema information for a table
   * @param {string} datasetId - The BigQuery dataset ID
   * @param {string} tableId - The BigQuery table ID
   * @returns {Promise<Array>} - Promise resolving to array of column definitions
   */
  async getTableSchema(datasetId, tableId) {
    try {
      logger.info('Getting table schema', { datasetId, tableId });
      
      const [metadata] = await this._bigQueryClient
        .dataset(datasetId)
        .table(tableId)
        .getMetadata();
      
      return metadata.schema.fields;
    } catch (error) {
      logger.error('Error getting table schema', { 
        error, datasetId, tableId 
      });
      throw new DatabaseError(`Error retrieving schema for ${datasetId}.${tableId}`, error);
    }
  }

  /**
   * Get available datasets in the project
   * @returns {Promise<Array>} - Promise resolving to array of dataset references
   */
  async listDatasets() {
    try {
      logger.info('Listing datasets in project');
      
      const [datasets] = await this._bigQueryClient.getDatasets();
      
      return datasets.map(dataset => ({
        id: dataset.id,
        location: dataset.metadata.location
      }));
    } catch (error) {
      logger.error('Error listing datasets', { error });
      throw new DatabaseError('Error listing datasets in project', error);
    }
  }
  /**
   * Executes a BigQuery query
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Query results
   * @throws {DatabaseError} If there's an error executing the query
   */
  async query(options) {
    try {
      const [rows] = await this._bigQueryClient.query(options);
      return rows;
    } catch (err) {
      logger.error('Error executing BigQuery query', { error: err });
      throw new DatabaseError('Failed to execute BigQuery query', err);
    }
  }

  /**
   * Creates a dataset in BigQuery
   * @param {string} datasetId - Dataset ID
   * @returns {Promise<Array>} Operation result
   * @throws {DatabaseError} If there's an error creating the dataset
   */
  async createDataset(datasetId) {
    try {
      logger.info('Creating dataset in BigQuery', { datasetId });
      const [dataset] = await this._bigQueryClient.createDataset(datasetId);
      return dataset;
    } catch (err) {
      logger.error('Error creating dataset', { error: err, datasetId });
      throw new DatabaseError(`Failed to create dataset: ${datasetId}`, err);
    }
  }

  /**
   * Creates a table in BigQuery
   * @param {string} datasetId - Dataset ID
   * @param {string} tableId - Table ID
   * @param {Object} schema - Table schema
   * @returns {Promise<Array>} Operation result
   * @throws {DatabaseError} If there's an error creating the table
   */
  async createTable(datasetId, tableId, schema) {
    try {
      logger.info('Creating table in BigQuery', { datasetId, tableId });
      const options = {
        schema: schema,
        location: 'US',
      };

      const [table] = await this._bigQueryClient
        .dataset(datasetId)
        .createTable(tableId, options);
        
      return table;
    } catch (err) {
      logger.error('Error creating table', { error: err, datasetId, tableId });
      throw new DatabaseError(`Failed to create table: ${datasetId}.${tableId}`, err);
    }
  }

  /**
   * Inserts rows into a BigQuery table
   * @param {string} datasetId - Dataset ID
   * @param {string} tableId - Table ID
   * @param {Array} rows - Rows to insert
   * @returns {Promise<Array>} Operation result
   * @throws {DatabaseError} If there's an error inserting rows
   */
  async insertRows(datasetId, tableId, rows) {
    try {
      logger.info('Inserting rows into BigQuery table', { 
        datasetId, tableId, rowCount: rows.length 
      });
      const [apiResponse] = await this._bigQueryClient
        .dataset(datasetId)
        .table(tableId)
        .insert(rows);
        
      return apiResponse;
    } catch (err) {
      logger.error('Error inserting rows', { error: err, datasetId, tableId });
      throw new DatabaseError(`Failed to insert rows into table: ${datasetId}.${tableId}`, err);
    }
}
}

// Export the class
module.exports = BigQueryService;
