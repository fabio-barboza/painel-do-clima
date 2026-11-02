const HttpError = require('../lib/httpError');

const INTERNAL_STATUS = 500;
const BAD_REQUEST_STATUS = 400;
const INTERNAL_ERROR_CODE = 'INTERNAL_ERROR';
const INVALID_PARAMS_CODE = 'INVALID_PARAMS';
const INTERNAL_ERROR_MESSAGE = 'Erro interno do servidor.';
const JSON_PARSE_ERROR_TYPE = 'entity.parse.failed';
const JSON_PARSE_ERROR_MESSAGE = 'Corpo da requisição não é um JSON válido.';

function toHttpError(err) {
  if (err instanceof HttpError) {
    return err;
  }
  if (err.type === JSON_PARSE_ERROR_TYPE) {
    return new HttpError(BAD_REQUEST_STATUS, INVALID_PARAMS_CODE, JSON_PARSE_ERROR_MESSAGE);
  }
  return new HttpError(INTERNAL_STATUS, INTERNAL_ERROR_CODE, INTERNAL_ERROR_MESSAGE);
}

function logUnexpectedError(err, status) {
  if (status === INTERNAL_STATUS) {
    console.error(err);
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }
  const httpError = toHttpError(err);
  logUnexpectedError(err, httpError.status);
  res.status(httpError.status).json({
    error: { code: httpError.code, message: httpError.message }
  });
}

module.exports = errorHandler;
