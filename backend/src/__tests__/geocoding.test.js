const { geocode } = require('../services/geocoding');

describe('geocoding service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('sucesso', () => {
    test('retorna coordenadas para cidade valida', async () => {
      const mockResponse = {
        results: [
          {
            name: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.63611,
            timezone: 'America/Sao_Paulo'
          }
        ]
      };

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await geocode('São Paulo');

      expect(result).toEqual({
        name: 'São Paulo',
        latitude: -23.5475,
        longitude: -46.63611,
        timezone: 'America/Sao_Paulo'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('geocoding-api.open-meteo.com'),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    test('chama API com parametros corretos', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' }]
        })
      });

      await geocode('Tokyo');

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('name=Tokyo');
      expect(calledUrl).toContain('count=1');
      expect(calledUrl).toContain('language=pt');
      expect(calledUrl).toContain('format=json');
    });
  });

  describe('cidade nao encontrada', () => {
    test('lanca erro com statusCode 404 quando results esta vazio', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      });

      await expect(geocode('CidadeInexistenteXYZ123')).rejects.toThrow('Cidade não encontrada');
      await expect(geocode('CidadeInexistenteXYZ123')).rejects.toMatchObject({ statusCode: 404 });
    });

    test('lanca erro quando results esta ausente', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      await expect(geocode('CidadeInexistenteXYZ123')).rejects.toThrow('Cidade não encontrada');
    });
  });

  describe('erro de rede', () => {
    test('lanca erro quando fetch falha', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(geocode('São Paulo')).rejects.toThrow('Network error');
    });

    test('lanca erro quando resposta nao e ok', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500
      });

      await expect(geocode('São Paulo')).rejects.toThrow('Erro ao consultar API de geocoding: 500');
    });
  });
});
