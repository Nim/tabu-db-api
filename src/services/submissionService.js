const { NotFoundError, ValidationError } = require('../errors/customErrors');
const BaseService = require('./baseService');

class SubmissionService extends BaseService {
  static #instance;

  constructor() {
    super('submission');
  }

  static getInstance() {
    if (!SubmissionService.#instance) {
      SubmissionService.#instance = new SubmissionService();
    }
    return SubmissionService.#instance;
  }

  #validateUniqueId(uniqueId) {
    if (!uniqueId) {
      throw new ValidationError('unique_id is required');
    }
    
    if (typeof uniqueId !== 'string') {
      throw new ValidationError('unique_id must be a string');
    }
  }

  async getSubmissionByUniqueId(uniqueId) {
    try {
      this.#validateUniqueId(uniqueId);
      
      const query = `SELECT position_group, position, seniority, tech, contract_type, country_salary 
        FROM \`${this._getTableName()}\` 
        WHERE unique_id = @unique_id`;

      const options = {
        query,
        params: { unique_id: uniqueId }
      };

      const results = await this._executeQuery(options);

      if (!results || !results.length) {
        return {
          success: false,
          response: {
            message: 'Submission not found',
            exists: false
          },
          action: 'getSubmissionByUniqueId',
          error: null
        };
      }

      return this._formatSuccess({
        message: 'Submission found',
        exists: true,
        ...results[0]
      }, 'GET', 'getSubmissionByUniqueId');

    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          response: {
            message: error.message,
            exists: false
          },
          action: 'getSubmissionByUniqueId',
          error: 'VALIDATION_ERROR'
        };
      }

      return this._handleError('Error retrieving submission', error);
    }
  }
}

// Export the singleton instance
module.exports = SubmissionService.getInstance();
