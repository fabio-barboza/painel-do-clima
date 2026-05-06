const errorHandler = require('../middleware/errorHandler');

describe('errorHandler middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('retorna erro 500 com mensagem generica para erro sem statusCode', () => {
    const err = new Error('Algum erro interno');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: 'Erro ao consultar o clima'
    });
  });

  test('retorna erro 404 com mensagem especifica', () => {
    const err = new Error('Cidade não encontrada');
    err.statusCode = 404;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: 'Cidade não encontrada'
    });
  });

  test('retorna erro 400 com mensagem especifica', () => {
    const err = new Error('Parâmetros inválidos');
    err.statusCode = 400;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: 'Parâmetros inválidos'
    });
  });

  test('loga erro no console para status 500', () => {
    const err = new Error('Internal failure');

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith(err);
  });

  test('nao loga erro no console para status diferente de 500', () => {
    const err = new Error('Cidade não encontrada');
    err.statusCode = 404;

    errorHandler(err, req, res, next);

    expect(console.error).not.toHaveBeenCalled();
  });
});
