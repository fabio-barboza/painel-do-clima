const CACHE_CONTROL_NO_STORE = 'no-store';

function noStore(req, res, next) {
  res.setHeader('Cache-Control', CACHE_CONTROL_NO_STORE);
  next();
}

module.exports = noStore;
