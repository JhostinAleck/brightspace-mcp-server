import type { CommunicationsRepository } from '@/contexts/communications/domain/CommunicationsRepository.js';
import { getAnnouncements } from '@/contexts/communications/application/getAnnouncements.js';
import { getAnnouncementsSchema } from '@/mcp/schemas.js';
import { announcementsToText } from '@/mcp/tool-helpers.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

export interface GetAnnouncementsDeps { communicationsRepo: CommunicationsRepository; }

export async function handleGetAnnouncements(deps: GetAnnouncementsDeps, rawInput: unknown) {
  const input = getAnnouncementsSchema.parse(rawInput);
  const items = await getAnnouncements({ repo: deps.communicationsRepo, courseId: OrgUnitId.of(input.course_id), limit: input.limit });
  return { content: [{ type: 'text' as const, text: announcementsToText(items) }] };
}
