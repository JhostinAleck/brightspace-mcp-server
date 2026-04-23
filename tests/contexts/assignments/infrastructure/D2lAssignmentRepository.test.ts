import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import nock from 'nock';
import { D2lAssignmentRepository } from '@/contexts/assignments/infrastructure/D2lAssignmentRepository';
import { D2lApiClient } from '@/contexts/http-api/D2lApiClient';
import { AccessToken } from '@/contexts/authentication/domain/AccessToken';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId';
import { AssignmentId } from '@/contexts/assignments/domain/AssignmentId';

const BASE = 'https://x.com';
const foldersFixture = JSON.parse(readFileSync(resolve(__dirname, '../../../fixtures/assignments/folders.json'), 'utf-8'));
const feedbackFixture = JSON.parse(readFileSync(resolve(__dirname, '../../../fixtures/assignments/feedback.json'), 'utf-8'));

afterEach(() => nock.cleanAll());

describe('D2lAssignmentRepository', () => {
  it('findByCourse parses dropbox folders into Assignment entities', async () => {
    nock(BASE).get('/d2l/api/le/1.91/101/dropbox/folders/').reply(200, foldersFixture);
    const client = new D2lApiClient({ baseUrl: BASE, getToken: async () => AccessToken.bearer('t') });
    const repo = new D2lAssignmentRepository(client, { le: '1.91' });
    const out = await repo.findByCourse(OrgUnitId.of(101));
    expect(out).toHaveLength(2);

    const essay = out.find((a) => a.name === 'Essay 1');
    expect(essay?.dueDate.toDate()?.toISOString()).toBe('2026-05-01T23:59:00.000Z');
    expect(essay?.submissions.length).toBe(1);

    const discussion = out.find((a) => a.name === 'Discussion Post');
    expect(discussion?.dueDate.toDate()).toBeNull();
    expect(discussion?.instructions).toBeNull();
  });

  it('findFeedback returns Feedback when the endpoint responds 200', async () => {
    nock(BASE)
      .get(/\/d2l\/api\/le\/1\.91\/101\/dropbox\/folders\/5001\/feedback\/me$/)
      .reply(200, feedbackFixture);
    const client = new D2lApiClient({ baseUrl: BASE, getToken: async () => AccessToken.bearer('t') });
    const repo = new D2lAssignmentRepository(client, { le: '1.91' });
    const fb = await repo.findFeedback(OrgUnitId.of(101), AssignmentId.of(5001));
    expect(fb?.score).toBe(88);
    expect(fb?.text).toContain('tighten');
  });

  it('findFeedback returns null on 404', async () => {
    nock(BASE)
      .get(/\/d2l\/api\/le\/1\.91\/101\/dropbox\/folders\/5002\/feedback\/me$/)
      .reply(404, '');
    const client = new D2lApiClient({ baseUrl: BASE, getToken: async () => AccessToken.bearer('t') });
    const repo = new D2lAssignmentRepository(client, { le: '1.91' });
    const fb = await repo.findFeedback(OrgUnitId.of(101), AssignmentId.of(5002));
    expect(fb).toBeNull();
  });
});
