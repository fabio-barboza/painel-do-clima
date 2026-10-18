function notFound(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Rota não encontrada.'
  });
}

function errorHandler(err, req, res, next) {
  const logEntry = {
    level: 'error',
    message: 'Unhandled error',
    method: req.method,
    path: req.originalUrl,
    query: req.query,
    params: req.params,
    stack: err.stack
  };
  console.error(JSON.stringify(logEntry));
  res.setHeader('Cache-Control', 'no-store');
  res.status(500).json({
    error: 'INTERNAL',
    message: 'Falha ao processar a requisição.'
  });
}

module.exports = { notFound, errorHandler };
