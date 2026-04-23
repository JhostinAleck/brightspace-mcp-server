import type { CommunicationsRepository } from '@/contexts/communications/domain/CommunicationsRepository.js';
import type { Announcement } from '@/contexts/communications/domain/Announcement.js';
import type { DiscussionForum } from '@/contexts/communications/domain/DiscussionForum.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

export class FakeCommunicationsRepository implements CommunicationsRepository {
  constructor(
    private readonly announcementsByCourse: Map<number, Announcement[]> = new Map(),
    private readonly discussionsByCourse: Map<number, DiscussionForum[]> = new Map(),
  ) {}

  async findAnnouncements(courseId: OrgUnitId, opts?: { limit?: number }): Promise<Announcement[]> {
    const all = this.announcementsByCourse.get(OrgUnitId.toNumber(courseId)) ?? [];
    return opts?.limit ? all.slice(0, opts.limit) : all;
  }

  async findDiscussions(courseId: OrgUnitId): Promise<DiscussionForum[]> {
    return this.discussionsByCourse.get(OrgUnitId.toNumber(courseId)) ?? [];
  }
}
