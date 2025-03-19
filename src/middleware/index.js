const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message,
    exists: false,
    action: req.method,
    type: 'ERROR',
    error: {
      status,
      message
    }
  });
};

module.exports = {
  errorHandler
};
