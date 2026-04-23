import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import nock from 'nock';
import { D2lGradeRepository } from '@/contexts/grades/infrastructure/D2lGradeRepository.js';
import { D2lApiClient } from '@/contexts/http-api/D2lApiClient.js';
import { AccessToken } from '@/contexts/authentication/domain/AccessToken.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

const BASE = 'https://x.com';
const fixturePath = resolve(__dirname, '../../../fixtures/grades/happy-path.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

afterEach(() => nock.cleanAll());

describe('D2lGradeRepository.findByCourse', () => {
  it('joins grade objects with my grade values', async () => {
    nock(BASE).get('/d2l/api/le/1.91/101/grades/').reply(200, fixture.gradeObjects);
    nock(BASE)
      .get('/d2l/api/le/1.91/101/grades/values/myGradeValues/')
      .reply(200, fixture.gradeValues);

    const client = new D2lApiClient({
      baseUrl: BASE,
      getToken: async () => AccessToken.bearer('t'),
    });
    const repo = new D2lGradeRepository(client, { le: '1.91' });
    const grades = await repo.findByCourse(OrgUnitId.of(101));

    expect(grades).toHaveLength(2);
    const exam = grades.find((g) => g.itemName === 'Exam 1');
    expect(exam?.pointsEarned).toBe(87);
    expect(exam?.percent).toBe(87);
    const project = grades.find((g) => g.itemName === 'Project');
    expect(project?.pointsEarned).toBeNull();
    expect(project?.percent).toBeNull();
  });
});
