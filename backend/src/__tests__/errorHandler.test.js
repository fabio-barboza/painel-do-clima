const errorHandler = require('../middleware/errorHandler');
const HttpError = require('../lib/httpError');

const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;
const INTERNAL_STATUS = 500;

function createFakeResponse() {
  const response = {
    headersSent: false,
    statusCode: undefined,
    body: undefined,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(payload) {
      response.body = payload;
      return response;
    }
  };
  return response;
}

function runErrorHandler(error) {
  const response = createFakeResponse();
  const next = jest.fn();
  errorHandler(error, {}, response, next);
  return { response, next };
}

describe('errorHandler', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should translate an HttpError to its status and error body', () => {
    const { response } = runErrorHandler(
      new HttpError(NOT_FOUND_STATUS, 'CITY_NOT_FOUND', 'Cidade não encontrada.')
    );

    expect(response.statusCode).toBe(NOT_FOUND_STATUS);
    expect(response.body).toEqual({
      error: { code: 'CITY_NOT_FOUND', message: 'Cidade não encontrada.' }
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  test('should answer an invalid JSON body with 400 INVALID_PARAMS', () => {
    const parseError = Object.assign(new SyntaxError('bad json'), { type: 'entity.parse.failed' });
    const { response } = runErrorHandler(parseError);

    expect(response.statusCode).toBe(BAD_REQUEST_STATUS);
    expect(response.body.error.code).toBe('INVALID_PARAMS');
  });

  test('should answer an unexpected error with 500 INTERNAL_ERROR and log it', () => {
    const unexpected = new Error('boom');
    const { response } = runErrorHandler(unexpected);

    expect(response.statusCode).toBe(INTERNAL_STATUS);
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' }
    });
    expect(console.error).toHaveBeenCalledWith(unexpected);
  });

  test('should delegate to next when headers were already sent', () => {
    const error = new Error('late');
    const response = createFakeResponse();
    response.headersSent = true;
    const next = jest.fn();
    errorHandler(error, {}, response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(response.body).toBeUndefined();
  });
});
