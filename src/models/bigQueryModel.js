/**
 * BigQueryModel - Table-specific model for BigQuery operations
 * 
 * This model provides a simple interface for interacting with specific BigQuery tables
 * using the BigQueryService singleton for connection pooling.
 */

const bigQueryService = require('../services/bigQueryInstance');
const { DatabaseError } = require('../errors/customErrors');
const config = require('../config/config');

class BigQueryModel {
  /**
   * Creates a new BigQueryModel instance for a specific table
   * @param {string} tableName - The name of the BigQuery table
   */
  constructor(tableName) {
    this.tableName = tableName;
    this.bqService = bigQueryService;
    this.schemaName = this.bqService.getSchemaName();
  }

  /**
   * Get the fully qualified table name in project.dataset.table format
   * @returns {string} - The fully qualified table name
   */
  getFullTableName() {
    return `${this.schemaName}.${this.tableName}`;
  }

  /**
   * Query the table with pagination
   * @param {number} limit - Maximum number of rows to return
   * @param {number} offset - Number of rows to skip
   * @param {string} where - Optional WHERE clause (without the 'WHERE' keyword)
   * @returns {Promise<Object>} - Results with pagination metadata
   */
  async query(limit = config.pagination.limit, offset = config.pagination.offset, where = null) {
    // Convert parameters to integers to ensure they're valid numbers
    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);
    
    // Build the query
    let sql = `SELECT * FROM \`${this.getFullTableName()}\``;
    
    // Add WHERE clause if provided
    if (where) {
      sql += ` WHERE ${where}`;
    }
    
    // Add pagination
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    
    try {
      const rows = await this.bqService.executeQuery(sql);
      
      // Create a result object with pagination metadata
      return {
        data: rows,
        pagination: {
          limit,
          offset,
          hasMore: rows.length === limit // If we got exactly 'limit' rows, there might be more
        }
      };
    } catch (err) {
      console.error('ERROR:', err);
      throw new DatabaseError(`Error querying table ${this.tableName}`, err);
    }
  }

  /**
   * Execute a custom SQL query against this table
   * @param {string} sql - SQL query string
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(sql, params = {}) {
    try {
      return await this.bqService.executeQuery(sql, params);
    } catch (err) {
      console.error('ERROR:', err);
      throw new DatabaseError(`Error executing query on ${this.tableName}`, err);
    }
  }

  /**
   * Find a record by a specific field value
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @returns {Promise<Object>} - The found record or null
   */
  async findBy(field, value) {
    const sql = `SELECT * FROM \`${this.getFullTableName()}\` WHERE ${field} = @value LIMIT 1`;
    const params = { value };
    
    try {
      const rows = await this.bqService.executeQuery(sql, params);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('ERROR:', err);
      throw new DatabaseError(`Error finding record in ${this.tableName}`, err);
    }
  }

  /**
   * Count total records in the table
   * @param {string} where - Optional WHERE clause (without the 'WHERE' keyword)
   * @returns {Promise<number>} - Total count
   */
  async count(where = null) {
    let sql = `SELECT COUNT(*) as count FROM \`${this.getFullTableName()}\``;
    
    if (where) {
      sql += ` WHERE ${where}`;
    }
    
    try {
      const rows = await this.bqService.executeQuery(sql);
      return parseInt(rows[0].count, 10);
    } catch (err) {
      console.error('ERROR:', err);
      throw new DatabaseError(`Error counting records in ${this.tableName}`, err);
    }
  }
}

module.exports = BigQueryModel;

