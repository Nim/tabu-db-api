const bigQueryInstance = require('./bigQueryInstance');
const config = require('../config/config');
const { DatabaseError } = require('../errors/customErrors');

class BaseService {
  constructor(tableName) {
    this._tableName = tableName;
  }

  _getTableName() {
    return `${config.bigQuery.defaultDataset}.${this._tableName}`;
  }

      async _executeQuery(options) {
        if (!options || !options.query) {
          throw new DatabaseError('Query options and query string are required');
        }
        try {
          console.log('Executing query with options:', JSON.stringify(options, null, 2));
          const rows = await bigQueryInstance.query(options);
          console.log('Query result rows:', rows?.length);
          if (!rows) {
            throw new DatabaseError('No results returned from query');
          }
          return rows;
        } catch (error) {
          console.error('Query execution error:', error);
          throw new DatabaseError(error.message || 'Error executing query');
        }
      }
      
      _formatSuccess(data, method, action) {
        return {
          success: true,
          response: {
            message: 'Operation successful',
            exists: true,
            ...(data || {})
          },
          action: action || method || 'QUERY'
        };
      }

      _handleError(message, error) {
        console.error(message, error);
        const errorResponse = {
          success: false,
          message: error?.message || message,
          exists: false,
          action: error?.action || 'ERROR',
          type: 'ERROR',
          error: {
            status: error?.status || 500,
            message: error?.message || message,
            code: error?.code,
            details: error?.details
          }
        };
        return errorResponse;
      }

      async getByUniqueId(uniqueId) {
        if (!uniqueId) {
          throw new DatabaseError('Unique ID is required');
        }
        const query = `SELECT * FROM \`${this._getTableName()}\` WHERE unique_id = @uniqueId LIMIT 1`;
        const options = {
          query,
          params: { uniqueId }
        };
        try {
          const rows = await this._executeQuery(options);
          if (!rows || rows.length === 0) {
            return this._formatSuccess({ exists: false, data: null }, 'GET', 'NOT_FOUND');
          }
          return this._formatSuccess({ data: rows[0] }, 'GET', 'FOUND');
        } catch (error) {
          return this._handleError('Error getting record by unique ID', error);
        }
      }

      async getAll() {
        const query = `SELECT * FROM \`${this._getTableName()}\``;
        const options = { query };
        try {
          const rows = await this._executeQuery(options);
          return this._formatSuccess({ data: rows }, 'GET_ALL', 'FOUND');
        } catch (error) {
          return this._handleError('Error getting all records', error);
        }
      }

      async getByField(fieldName, value) {
        if (!fieldName || value === undefined) {
          throw new DatabaseError('Field name and value are required');
        }
        const query = `SELECT * FROM \`${this._getTableName()}\` WHERE ${fieldName} = @value`;
        const options = {
          query,
          params: { value }
        };
        try {
          const rows = await this._executeQuery(options);
          return this._formatSuccess({ data: rows }, 'GET_BY_FIELD', 'FOUND');
        } catch (error) {
          return this._handleError(`Error getting records by field ${fieldName}`, error);
        }
      }
}

module.exports = BaseService;
