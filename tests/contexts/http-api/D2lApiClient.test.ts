import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { D2lApiClient } from '@/contexts/http-api/D2lApiClient.js';
import { AccessToken } from '@/contexts/authentication/domain/AccessToken.js';

const BASE = 'https://sandbox.d2l.com';

describe('D2lApiClient.get', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('sends Authorization header and parses JSON', async () => {
    nock(BASE)
      .get('/d2l/api/lp/1.56/users/whoami')
      .matchHeader('authorization', 'Bearer tok_abc')
      .reply(200, { Identifier: '99', DisplayName: 'Test', UniqueName: 'test@x' });

    const client = new D2lApiClient({
      baseUrl: BASE,
      getToken: async () => AccessToken.bearer('tok_abc'),
    });
    const body = await client.get<{ DisplayName: string }>('/d2l/api/lp/1.56/users/whoami');
    expect(body.DisplayName).toBe('Test');
  });

  it('throws D2lApiError on non-2xx', async () => {
    nock(BASE).get('/bad').reply(500, 'oops');
    const client = new D2lApiClient({
      baseUrl: BASE,
      getToken: async () => AccessToken.bearer('t'),
    });
    await expect(client.get('/bad')).rejects.toMatchObject({ code: 'HTTP_500' });
  });

  it('rejects http:// base URLs', () => {
    expect(
      () =>
        new D2lApiClient({
          baseUrl: 'http://insecure',
          getToken: async () => AccessToken.bearer('t'),
        }),
    ).toThrow();
  });
});
