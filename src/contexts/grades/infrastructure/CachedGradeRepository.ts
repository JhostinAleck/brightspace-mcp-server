import type { GradeRepository } from '@/contexts/grades/domain/GradeRepository.js';
import { Grade } from '@/contexts/grades/domain/Grade.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';
import type { Cache } from '@/shared-kernel/cache/Cache.js';

export interface CachedGradeRepositoryTtls {
  ttlMs: number;
}

const PREFIX = 'grades:';

interface GradePlain {
  itemId: number;
  itemName: string;
  pointsEarned: number | null;
  pointsMax: number;
  percent: number | null;
  displayedGrade: string | null;
}

function toPlain(grade: Grade): GradePlain {
  return {
    itemId: grade.itemId,
    itemName: grade.itemName,
    pointsEarned: grade.pointsEarned,
    pointsMax: grade.pointsMax,
    percent: grade.percent,
    displayedGrade: grade.displayedGrade,
  };
}

function fromPlain(plain: GradePlain): Grade {
  return new Grade(plain);
}

export class CachedGradeRepository implements GradeRepository {
  constructor(
    private readonly inner: GradeRepository,
    private readonly cache: Cache,
    private readonly ttls: CachedGradeRepositoryTtls,
  ) {}

  async findByCourse(courseId: OrgUnitId): Promise<Grade[]> {
    const key = `${PREFIX}${OrgUnitId.toNumber(courseId)}`;
    const cached = await this.cache.get<GradePlain[]>(key);
    if (cached) return cached.map(fromPlain);
    const fresh = await this.inner.findByCourse(courseId);
    await this.cache.set(key, fresh.map(toPlain), this.ttls.ttlMs);
    return fresh;
  }
}
