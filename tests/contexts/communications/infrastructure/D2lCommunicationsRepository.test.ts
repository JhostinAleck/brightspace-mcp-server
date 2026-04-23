import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import nock from 'nock';
import { D2lCommunicationsRepository } from '@/contexts/communications/infrastructure/D2lCommunicationsRepository.js';
import { D2lApiClient } from '@/contexts/http-api/D2lApiClient.js';
import { AccessToken } from '@/contexts/authentication/domain/AccessToken.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

const BASE = 'https://x.com';
const announcementsFixture = JSON.parse(
  readFileSync(resolve(__dirname, '../../../fixtures/announcements/happy-path.json'), 'utf-8'),
);
const forumsFixture = JSON.parse(
  readFileSync(resolve(__dirname, '../../../fixtures/discussions/forums.json'), 'utf-8'),
);

afterEach(() => nock.cleanAll());

describe('D2lCommunicationsRepository', () => {
  it('findAnnouncements parses news entries', async () => {
    nock(BASE).get('/d2l/api/le/1.91/101/news/').reply(200, announcementsFixture);
    const client = new D2lApiClient({ baseUrl: BASE, getToken: async () => AccessToken.bearer('t') });
    const repo = new D2lCommunicationsRepository(client, { le: '1.91' });
    const out = await repo.findAnnouncements(OrgUnitId.of(101));
    expect(out).toHaveLength(2);
    expect(out[0]?.title).toBe('Midterm next week');
    expect(out[0]?.authorName).toBe('Prof X');
  });

  it('findDiscussions fetches forums then topics', async () => {
    nock(BASE).get('/d2l/api/le/1.91/101/discussions/forums/').reply(200, forumsFixture.forums);
    nock(BASE)
      .get('/d2l/api/le/1.91/101/discussions/forums/500/topics/')
      .reply(200, forumsFixture.topics_500);
    const client = new D2lApiClient({ baseUrl: BASE, getToken: async () => AccessToken.bearer('t') });
    const repo = new D2lCommunicationsRepository(client, { le: '1.91' });
    const out = await repo.findDiscussions(OrgUnitId.of(101));
    expect(out).toHaveLength(1);
    expect(out[0]?.topics[0]?.name).toBe('Q&A');
    expect(out[0]?.topics[0]?.postCount).toBe(42);
  });
});
