const { BigQuery } = require('@google-cloud/bigquery');
const { DatabaseError } = require('../errors/customErrors');

class BigQueryInstance {
  constructor() {
    this._client = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  getClient() {
    return this._client;
  }

  async query(options) {
    if (!options || !options.query) {
      throw new DatabaseError('Query options are required');
    }
    
    try {
      console.log('Executing BigQuery query:', {
        query: options.query,
        params: options.params
      });
      
      const [rows] = await this._client.query({
        query: options.query,
        params: options.params || {}
      });

      return rows;
    } catch (error) {
      console.error('BigQuery query error:', error);
      throw new DatabaseError(error.message || 'Error executing query');
    }
  }
}

// Create and export a singleton instance
const instance = new BigQueryInstance();
module.exports = instance;
