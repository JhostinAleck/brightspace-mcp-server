import type { CommunicationsRepository } from '@/contexts/communications/domain/CommunicationsRepository.js';
import type { DiscussionForum } from '@/contexts/communications/domain/DiscussionForum.js';
import type { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

export interface GetDiscussionsInput {
  repo: CommunicationsRepository;
  courseId: OrgUnitId;
}

export function getDiscussions(input: GetDiscussionsInput): Promise<DiscussionForum[]> {
  return input.repo.findDiscussions(input.courseId);
}
