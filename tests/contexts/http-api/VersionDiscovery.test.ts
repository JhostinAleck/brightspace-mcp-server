import { describe, it, expect, afterEach } from 'vitest';
import nock from 'nock';
import { discoverVersions } from '@/contexts/http-api/VersionDiscovery.js';

afterEach(() => nock.cleanAll());

describe('discoverVersions', () => {
  it('picks highest LP and LE versions from /d2l/api/versions/', async () => {
    nock('https://x.com').get('/d2l/api/versions/').reply(200, [
      { ProductCode: 'lp', LatestVersion: '1.56' },
      { ProductCode: 'le', LatestVersion: '1.91' },
      { ProductCode: 'lti', LatestVersion: '1.0' },
    ]);
    const v = await discoverVersions('https://x.com');
    expect(v).toEqual({ lp: '1.56', le: '1.91' });
  });
  it('throws if LP or LE missing', async () => {
    nock('https://x.com').get('/d2l/api/versions/').reply(200, [{ ProductCode: 'lti', LatestVersion: '1.0' }]);
    await expect(discoverVersions('https://x.com')).rejects.toThrow(/lp|le/i);
  });
});
