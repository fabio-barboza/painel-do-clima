const ALLOWED_METHODS = 'GET, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type';
const PREFLIGHT_STATUS = 204;
const WILDCARD_ORIGIN = '*';

function parseCorsOrigins(rawOrigins) {
  if (!rawOrigins) {
    return [];
  }
  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function resolveAllowedOrigin({ requestOrigin, origins, isProduction }) {
  if (origins.length > 0) {
    return origins.includes(requestOrigin) ? requestOrigin : null;
  }
  return isProduction ? null : WILDCARD_ORIGIN;
}

function applyCorsHeaders(res, allowedOrigin) {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
}

function createCors({ origins = [], isProduction = false } = {}) {
  return function cors(req, res, next) {
    if (origins.length > 0) {
      res.setHeader('Vary', 'Origin');
    }

    const allowedOrigin = resolveAllowedOrigin({
      requestOrigin: req.headers.origin,
      origins,
      isProduction
    });

    if (allowedOrigin) {
      applyCorsHeaders(res, allowedOrigin);
    }

    if (req.method === 'OPTIONS') {
      res.status(PREFLIGHT_STATUS).end();
      return;
    }

    next();
  };
}

module.exports = { createCors, parseCorsOrigins };
