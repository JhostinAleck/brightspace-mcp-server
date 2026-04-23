import type { GradeRepository } from '@/contexts/grades/domain/GradeRepository.js';
import { Grade } from '@/contexts/grades/domain/Grade.js';
import type { D2lApiClient } from '@/contexts/http-api/D2lApiClient.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

interface GradeObjectDto {
  Id: number;
  Name: string;
  GradeType: string;
  MaxPoints: number;
  Weight?: number;
}

interface GradeValueDto {
  GradeObjectIdentifier: string;
  PointsNumerator: number | null;
  PointsDenominator: number;
  DisplayedGrade: string | null;
}

export interface D2lGradeRepositoryOptions {
  le: string;
}

export class D2lGradeRepository implements GradeRepository {
  constructor(
    private readonly client: D2lApiClient,
    private readonly versions: D2lGradeRepositoryOptions,
  ) {}

  async findByCourse(courseId: OrgUnitId): Promise<Grade[]> {
    const orgUnit = OrgUnitId.toNumber(courseId);
    const [items, values] = await Promise.all([
      this.client.get<GradeObjectDto[]>(
        `/d2l/api/le/${this.versions.le}/${orgUnit}/grades/`,
      ),
      this.client.get<GradeValueDto[]>(
        `/d2l/api/le/${this.versions.le}/${orgUnit}/grades/values/myGradeValues/`,
      ),
    ]);

    const valueById = new Map<number, GradeValueDto>();
    for (const v of values) valueById.set(Number.parseInt(v.GradeObjectIdentifier, 10), v);

    return items.map((item) => {
      const value = valueById.get(item.Id);
      const pointsEarned = value?.PointsNumerator ?? null;
      const pointsMax = value?.PointsDenominator ?? item.MaxPoints;
      const percent =
        pointsEarned !== null && pointsMax > 0 ? (pointsEarned / pointsMax) * 100 : null;
      return new Grade({
        itemId: item.Id,
        itemName: item.Name,
        pointsEarned,
        pointsMax,
        percent,
        displayedGrade: value?.DisplayedGrade ?? null,
      });
    });
  }
}
