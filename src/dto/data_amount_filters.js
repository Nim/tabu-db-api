const { errorResponseDTO } = require('./error');

function successDataAmountFiltersDTO(message, action, data) {
  return {
    success: true,
    response: {
      message,
      exists: true,
      data: {
        data_amount: data.data_amount,
        salary_net_avg: data.salary_net_avg,
        salary_net_median: data.salary_net_median,
        salary_gross_avg: data.salary_gross_avg,
        salary_gross_median: data.salary_gross_median
      }
    },
    type: 'data_amount_filters',
    action,
    error: null
  };
}

function errorDataAmountFiltersDTO(message, action, error) {
  return errorResponseDTO(false, message, action, error);
}

module.exports = {
  successDataAmountFiltersDTO,
  errorDataAmountFiltersDTO
};
