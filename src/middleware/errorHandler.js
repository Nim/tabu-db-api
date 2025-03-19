const { ValidationError, NotFoundError, DatabaseError } = require('../errors/customErrors');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Add extra logging for test environment
  if (process.env.NODE_ENV === 'test') {
    console.error('ERROR HANDLER CAUGHT:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      status: err.status,
      path: req.path,
      method: req.method,
      query: req.query,
      params: req.params
    });
  }

  // Log the error
  logger.error(err.message, {
    path: req.path,
    method: req.method,
    errorType: err.constructor.name,
    ...(isDev && { stack: err.stack })
  });

  // Base error response
  const errorResponse = {
    success: false,
    statusCode: 500,
    type: 'INTERNAL_SERVER_ERROR',
    message: isDev ? err.message : 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Customize response based on error type
  if (err instanceof ValidationError) {
    errorResponse.statusCode = 400;
    errorResponse.type = 'VALIDATION_ERROR';
    errorResponse.message = err.message; // Always show validation messages
    if (isDev && err.errors) {
      errorResponse.errors = err.errors;
    }
  } else if (err instanceof NotFoundError) {
    errorResponse.statusCode = 404;
    errorResponse.type = 'NOT_FOUND_ERROR';
    errorResponse.message = err.message; // Always show not found messages
  } else if (err instanceof DatabaseError) {
    errorResponse.statusCode = 500;
    errorResponse.type = 'DATABASE_ERROR';
    errorResponse.message = err.message; // Always show database error messages
    if (isDev && err.cause) {
      errorResponse.cause = err.cause;
    }
  }

  // Add stack trace only in non-production environments
  if (isDev && err.stack) {
    errorResponse.stack = err.stack;
  }

  return res.status(errorResponse.statusCode).json(errorResponse);
};

module.exports = errorHandler;

