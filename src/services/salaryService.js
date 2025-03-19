const BaseService = require('./baseService');
const { ValidationError, NotFoundError } = require('../errors/customErrors');
const { responseSalaryData } = require('../dto/salary');

class SalaryService extends BaseService {
  static instance = null;

  constructor() {
    super('salary');
  }

  static getInstance() {
    if (!SalaryService.instance) {
      SalaryService.instance = new SalaryService();
    }
    return SalaryService.instance;
  }

  #validateUniqueId(uniqueId) {
    if (!uniqueId) {
      throw new ValidationError('Unique ID is required');
    }

    if (typeof uniqueId !== 'string') {
      throw new ValidationError('Unique ID must be a string');
    }
  }

  async getSalaryByUniqueId(uniqueId) {
    try {
      this.#validateUniqueId(uniqueId);
      
      const query = `
        SELECT
          salary_net,
          salary_gross
        FROM
          \`${this._getTableName()}\`
        WHERE
          unique_id = @unique_id
        LIMIT 1
      `;

      const options = {
        query,
        params: { unique_id: uniqueId }
      };

      const rows = await this._executeQuery(options);

      if (!rows || rows.length === 0) {
        throw new NotFoundError(`Salary data not found for unique ID: ${uniqueId}`);
      }

      const salaryData = {
        net: rows[0].salary_net,
        gross: rows[0].salary_gross
      };

      return this._formatSuccess(
        salaryData,
        'GET',
        'getSalaryByUniqueId'
      );
    } catch (error) {
      return this._handleError('Failed to retrieve salary data', error);
    }
  }

  async getAllSalaries(limit = 10) {
    try {
      const query = `
        SELECT * 
        FROM \`${this._getTableName()}\` 
        LIMIT @limit
      `;

      const options = {
        query,
        params: { limit }
      };

      const rows = await this._executeQuery(options);
      
      const salaryData = rows.map(row => ({
        net: row.salary_net,
        gross: row.salary_gross
      }));

      return this._formatSuccess(
        salaryData,
        'GET',
        'getAllSalaries'
      );
    } catch (error) {
      return this._handleError('Failed to retrieve salary data', error);
    }
  }
}

module.exports = SalaryService.getInstance();
