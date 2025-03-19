const { ValidationError } = require('../errors/customErrors');

/**
 * List of allowed tables in the database
 */
const ALLOWED_TABLES = [
  'salary',
  'submission',
  'user',
  'company',
  'job',
  'list_contract_type',
  // Add other allowed tables here
];

/**
 * Validates if the provided table name is valid and exists in the allowed tables list
 * @param {string} tableName - The name of the table to validate
 * @returns {boolean} - True if table name is valid, otherwise throws ValidationError
 * @throws {ValidationError} - If table name is invalid or not in the allowed list
 */
const validateTableName = (tableName) => {
  if (!tableName) {
    throw new ValidationError('Table name is required');
  }

  if (typeof tableName !== 'string') {
    throw new ValidationError('Table name must be a string');
  }

  // Check if table exists in allowed tables
  if (!ALLOWED_TABLES.includes(tableName.toLowerCase())) {
    throw new ValidationError(`Invalid table name: ${tableName}. Allowed tables: ${ALLOWED_TABLES.join(', ')}`);
  }

  return true;
};

/**
 * Validates query parameters for API requests
 * @param {object} query - The query parameters object
 * @param {Array} requiredParams - List of required parameters
 * @returns {boolean} - True if all required parameters exist, otherwise throws ValidationError
 * @throws {ValidationError} - If any required parameter is missing
 */
const validateQueryParams = (query, requiredParams = []) => {
  if (!query) {
    throw new ValidationError('Query parameters are required');
  }

  const missingParams = requiredParams.filter(param => !query[param]);
  
  if (missingParams.length > 0) {
    throw new ValidationError(`Missing required parameters: ${missingParams.join(', ')}`);
  }

  return true;
};

/**
 * Validates pagination parameters
 * @param {object} params - Object containing pagination parameters
 * @param {number} params.page - Page number (starting from 1)
 * @param {number} params.limit - Number of records per page
 * @returns {object} - Validated and normalized pagination parameters
 * @throws {ValidationError} - If pagination parameters are invalid
 */
const validatePagination = ({ page, limit }) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  
  if (pageNum < 1) {
    throw new ValidationError('Page must be a positive integer');
  }
  
  if (limitNum < 1 || limitNum > 100) {
    throw new ValidationError('Limit must be between 1 and 100');
  }
  
  return { page: pageNum, limit: limitNum };
};

/**
 * Middleware to validate table name in request parameters
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const tableNameValidator = (req, res, next) => {
  try {
    const { tableName } = req.params;
    validateTableName(tableName);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateTableName,
  validateQueryParams,
  validatePagination,
  tableNameValidator,
  ALLOWED_TABLES
};

