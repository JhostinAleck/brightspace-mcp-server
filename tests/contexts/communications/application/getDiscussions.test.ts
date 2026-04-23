import { describe, it, expect } from 'vitest';
import { getDiscussions } from '@/contexts/communications/application/getDiscussions';
import { DiscussionForum } from '@/contexts/communications/domain/DiscussionForum';
import { DiscussionTopic } from '@/contexts/communications/domain/DiscussionTopic';
import { FakeCommunicationsRepository } from '@tests/helpers/fakes/FakeCommunicationsRepository';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId';

describe('getDiscussions', () => {
  it('returns forums with their topics', async () => {
    const topic = new DiscussionTopic({ id: 1, name: 'Q&A', description: null, postCount: 3, lastPostAt: null });
    const forum = new DiscussionForum({ id: 100, name: 'Main', topics: [topic] });
    const repo = new FakeCommunicationsRepository(new Map(), new Map([[101, [forum]]]));
    const out = await getDiscussions({ repo, courseId: OrgUnitId.of(101) });
    expect(out).toHaveLength(1);
    expect(out[0]?.topics[0]?.name).toBe('Q&A');
  });
});
