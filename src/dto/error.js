function errorResponseDTO(success, message, action, error) {
  return {
    success: false,
    message: error.message || message,
    exists: false,
    action,
    type: 'ERROR',
    error: {
      status: error.statusCode || 500,
      message: error.message || message
    }
  };
}

module.exports = {
  errorResponseDTO
};

