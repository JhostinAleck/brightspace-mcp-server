import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CachedGradeRepository } from '@/contexts/grades/infrastructure/CachedGradeRepository';
import { FakeGradeRepository } from '@tests/helpers/fakes/FakeGradeRepository';
import { InMemoryCache } from '@/shared-kernel/cache/InMemoryCache';
import { Grade } from '@/contexts/grades/domain/Grade';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId';

const g = (id: number, name: string, percent: number) =>
  new Grade({ itemId: id, itemName: name, pointsEarned: percent, pointsMax: 100, percent, displayedGrade: `${percent}` });

describe('CachedGradeRepository', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('delegates and caches per course', async () => {
    const inner = new FakeGradeRepository(new Map([[101, [g(1, 'Exam', 90)]]]));
    const spy = vi.spyOn(inner, 'findByCourse');
    const repo = new CachedGradeRepository(inner, new InMemoryCache(), { ttlMs: 60_000 });

    await repo.findByCourse(OrgUnitId.of(101));
    await repo.findByCourse(OrgUnitId.of(101));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('caches separately per course', async () => {
    const inner = new FakeGradeRepository(new Map([[101, [g(1, 'A', 90)]], [202, [g(2, 'B', 80)]]]));
    const spy = vi.spyOn(inner, 'findByCourse');
    const repo = new CachedGradeRepository(inner, new InMemoryCache(), { ttlMs: 60_000 });

    await repo.findByCourse(OrgUnitId.of(101));
    await repo.findByCourse(OrgUnitId.of(202));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('expires after TTL', async () => {
    const inner = new FakeGradeRepository(new Map([[101, [g(1, 'A', 90)]]]));
    const spy = vi.spyOn(inner, 'findByCourse');
    const repo = new CachedGradeRepository(inner, new InMemoryCache(), { ttlMs: 1_000 });

    await repo.findByCourse(OrgUnitId.of(101));
    vi.advanceTimersByTime(1_500);
    await repo.findByCourse(OrgUnitId.of(101));
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
