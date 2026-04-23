import type { CalendarRepository } from '@/contexts/calendar/domain/CalendarRepository.js';
import { getCalendarEvents } from '@/contexts/calendar/application/getCalendarEvents.js';
import { getCalendarEventsSchema } from '@/mcp/schemas.js';
import { calendarEventsToText } from '@/mcp/tool-helpers.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

export interface GetCalendarEventsDeps { calendarRepo: CalendarRepository; }

export async function handleGetCalendarEvents(deps: GetCalendarEventsDeps, rawInput: unknown) {
  const input = getCalendarEventsSchema.parse(rawInput);
  const from = new Date();
  const to = new Date(from.getTime() + input.days * 24 * 60 * 60 * 1000);
  const events = await getCalendarEvents({
    repo: deps.calendarRepo,
    courseId: OrgUnitId.of(input.course_id),
    from,
    to,
  });
  return { content: [{ type: 'text' as const, text: calendarEventsToText(events, input.days) }] };
}
