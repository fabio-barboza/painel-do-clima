const { corsOrigins, corsAllowedAnyOrigin } = require('../config');

const ALLOWED_METHODS = 'GET, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';

function resolveOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) {
    return null;
  }
  if (corsAllowedAnyOrigin) {
    return origin;
  }
  return corsOrigins.includes(origin) ? origin : null;
}

function cors(req, res, next) {
  const origin = resolveOrigin(req);
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

module.exports = cors;
