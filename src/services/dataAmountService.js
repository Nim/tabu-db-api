const BaseService = require('./baseService');
const { ValidationError, NotFoundError } = require('../errors/customErrors');
const config = require('../config/config');

class DataAmountService extends BaseService {
  static instance = null;

  constructor() {
    super('data_amount');
  }

  static getInstance() {
    if (!DataAmountService.instance) {
      DataAmountService.instance = new DataAmountService();
    }
    return DataAmountService.instance;
  }

  #validateUniqueId(uniqueId) {
    if (!uniqueId) {
      throw new ValidationError('Unique ID is required');
    }

    if (typeof uniqueId !== 'string') {
      throw new ValidationError('Unique ID must be a string');
    }
  }

  #validatePositionParams(position_group, position) {
    if (!position_group && !position) {
      throw new ValidationError('Must provide either position_group or position');
    }
    if (position_group && position) {
      throw new ValidationError('Cannot provide both position_group and position. Please provide only one.');
    }
  }

  #validateRequiredParams(filters) {
    const requiredParams = ['parameter_seniority', 'parameter_country_salary', 'parameter_contract_type'];
    for (const param of requiredParams) {
      if (!filters[param]) {
        throw new ValidationError(`${param} is required`);
      }
    }
  }

  #formatArrayParam(param) {
    if (!param) return null;
    if (Array.isArray(param)) {
      return param.join('|');
    }
    return param;
  }

  async getDataAmountByUniqueId(uniqueId) {
    try {
      this.#validateUniqueId(uniqueId);
      
      const query = `
        SELECT
          amount
        FROM
          \`${this._getTableName()}\`
        WHERE
          unique_id = @unique_id
        LIMIT 1
      `;

      const options = {
        query,
        params: { unique_id: uniqueId },
        types: { unique_id: 'STRING' }
      };

      const rows = await this._executeQuery(options);

      if (!rows || rows.length === 0) {
        throw new NotFoundError(`Data amount not found for unique ID: ${uniqueId}`);
      }

      return this._formatSuccess(
        { amount: rows[0].amount },
        'GET',
        'getDataAmountByUniqueId'
      );
    } catch (error) {
      return this._handleError('Failed to retrieve data amount', error);
    }
  }

  async getDataAmountWithFilters(filters) {
    try {
      if (!filters || typeof filters !== 'object') {
        throw new ValidationError('Filters must be provided as an object');
      }

      // Validate required parameters
      this.#validateRequiredParams(filters);
      
      // Validate position parameters
      this.#validatePositionParams(
        filters.parameter_position_group,
        filters.parameter_position
      );

      // Format parameters
      const params = {
        // Position parameters must be exactly null or value, not empty string
        parameter_position_group: filters.parameter_position_group || null,
        parameter_position: filters.parameter_position || null,
        // Required parameters with pipe-separated values
        parameter_seniority: this.#formatArrayParam(filters.parameter_seniority),
        parameter_country_salary: this.#formatArrayParam(filters.parameter_country_salary),
        parameter_contract_type: this.#formatArrayParam(filters.parameter_contract_type),
        // Optional tech parameter
        parameter_tech: filters.parameter_tech ? this.#formatArrayParam(filters.parameter_tech) : null
      };

      const query = `
        SELECT *
        FROM \`${config.database.schema}.getDataAmountWithFilters\`(
          @parameter_position_group,
          @parameter_position,
          @parameter_seniority,
          @parameter_country_salary,
          @parameter_contract_type,
          @parameter_tech
        )
      `;

      console.log('Query:', query);
      console.log('Parameters:', JSON.stringify(params, null, 2));

      const options = {
        query,
        params,
        types: {
          parameter_position_group: 'STRING',
          parameter_position: 'STRING',
          parameter_seniority: 'STRING',
          parameter_country_salary: 'STRING',
          parameter_contract_type: 'STRING',
          parameter_tech: 'STRING'
        }
      };

      const rows = await this._executeQuery(options);

      if (!rows || rows.length === 0) {
        throw new NotFoundError('No data amount found for the specified filters');
      }

      return this._formatSuccess(
        rows[0],
        'GET',
        'getDataAmountWithFilters'
      );
    } catch (error) {
      console.error('Error in getDataAmountWithFilters:', error);
      return this._handleError('Failed to retrieve filtered data amount', error);
    }
  }
}

module.exports = DataAmountService.getInstance();
