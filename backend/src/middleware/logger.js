function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
}

function logError(err, req, res) {
  const details = {
    method: req.method,
    path: req.path,
    status: res && res.statusCode ? res.statusCode : null,
    error: err && err.message ? err.message : String(err)
  };
  console.error(JSON.stringify(details));
}

module.exports = { logger, logError };
