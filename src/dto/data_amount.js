const { errorResponseDTO } = require('./error');

function successDataAmountDTO(message, amount, action) {
  return {
    success: true,
    message,
    exists: true,
    type: 'data_amount',
    action,
    data: {
      amount
    },
    error: null
  };
}

function errorDataAmountDTO(message, action, error) {
  return errorResponseDTO(false, message, action, error);
}

module.exports = {
  successDataAmountDTO,
  errorDataAmountDTO
};
