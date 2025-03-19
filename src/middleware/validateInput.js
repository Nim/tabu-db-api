const { ValidationError } = require('../errors/customErrors');

/**
 * Validates if a string is a valid email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - Whether the email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


/**
 * Middleware to validate request inputs for different endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateInput = (req, res, next) => {
  const { email, unique_id } = req.body;
  const path = req.path;

  // User endpoint validations
  if (path === '/user/check') {
    if (!email) {
      throw new ValidationError('Email parameter is required');
    }
    
    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format provided');
    }
  }

  // Endpoints requiring unique_id validation
  const uniqueIdRequiredEndpoints = [
    { path: '/submission/check', name: 'submission' },
    { path: '/additional_position/check', name: 'additional position' },
    { path: '/salary/check', name: 'salary' }
  ];

  const currentEndpoint = uniqueIdRequiredEndpoints.find(endpoint => endpoint.path === path);
  
  if (currentEndpoint) {
    if (!unique_id) {
      throw new ValidationError(`unique_id parameter is required for ${currentEndpoint.name} check`);
    }
  }

  // Additional validations for query parameters if needed
  if (path.includes('/query') && Object.keys(req.query).length === 0) {
    throw new ValidationError('At least one query parameter is required');
  }

  // Proceed if all validations pass
  next();
};

module.exports = validateInput;
