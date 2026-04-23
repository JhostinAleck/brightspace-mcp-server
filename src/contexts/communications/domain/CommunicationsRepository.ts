import type { Announcement } from './Announcement.js';
import type { DiscussionForum } from './DiscussionForum.js';
import type { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

export interface CommunicationsRepository {
  findAnnouncements(courseId: OrgUnitId, opts?: { limit?: number }): Promise<Announcement[]>;
  findDiscussions(courseId: OrgUnitId): Promise<DiscussionForum[]>;
}
