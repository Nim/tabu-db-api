class ApplicationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ApplicationError';
    this.type = 'APPLICATION_ERROR';
    this.statusCode = 500;
    this.cause = cause;
  }
}

class DatabaseError extends ApplicationError {
  constructor(message, cause) {
    super(message, cause);
    this.name = 'DatabaseError';
    this.type = 'DATABASE_ERROR';
  }
}

class ValidationError extends ApplicationError {
  constructor(message, cause) {
    super(message, cause);
    this.name = 'ValidationError';
    this.type = 'VALIDATION_ERROR';
    this.statusCode = 400;
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message, cause) {
    super(message, cause);
    this.name = 'AuthenticationError';
    this.type = 'AUTHENTICATION_ERROR';
    this.statusCode = 401;
  }
}

class AuthorizationError extends ApplicationError {
  constructor(message, cause) {
    super(message, cause);
    this.name = 'AuthorizationError';
    this.type = 'AUTHORIZATION_ERROR';
    this.statusCode = 403;
  }
}

class NotFoundError extends ApplicationError {
  constructor(message, cause) {
    super(message, cause);
    this.name = 'NotFoundError';
    this.type = 'NOT_FOUND_ERROR';
    this.statusCode = 404;
  }
}

module.exports = {
  ApplicationError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
};
