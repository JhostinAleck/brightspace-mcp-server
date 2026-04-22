import type { Course } from '@/contexts/courses/Course.js';
import { CourseId } from '@/contexts/courses/CourseId.js';

export function coursesToCompact(courses: Course[]): string {
  if (courses.length === 0) return 'You have no courses.';
  const lines = courses.map(
    (c) =>
      ` • ${c.name} — ${c.code} (id=${CourseId.toNumber(c.id)})${c.active ? '' : ' [inactive]'}`,
  );
  return `You have ${courses.length} course${courses.length === 1 ? '' : 's'}:\n${lines.join('\n')}`;
}

export function coursesToDetailed(courses: Course[]): string {
  return courses
    .map((c) => {
      const dates =
        c.startDate && c.endDate
          ? ` | ${c.startDate.toISOString().slice(0, 10)} → ${c.endDate.toISOString().slice(0, 10)}`
          : '';
      return `• ${c.name} (${c.code}, id=${CourseId.toNumber(c.id)}) [${c.active ? 'active' : 'inactive'}]${dates}`;
    })
    .join('\n');
}
