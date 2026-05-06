function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'Erro ao consultar o clima'
    : err.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: true,
    message
  });
}

module.exports = errorHandler;
