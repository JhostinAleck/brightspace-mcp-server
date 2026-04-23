import { describe, it, expect, vi } from 'vitest';
import { CachedCommunicationsRepository } from '@/contexts/communications/infrastructure/CachedCommunicationsRepository.js';
import { FakeCommunicationsRepository } from '@tests/helpers/fakes/FakeCommunicationsRepository.js';
import { Announcement } from '@/contexts/communications/domain/Announcement.js';
import { DiscussionForum } from '@/contexts/communications/domain/DiscussionForum.js';
import { InMemoryCache } from '@/shared-kernel/cache/InMemoryCache.js';
import { OrgUnitId } from '@/shared-kernel/types/OrgUnitId.js';

describe('CachedCommunicationsRepository', () => {
  it('caches announcements', async () => {
    const a = new Announcement({
      id: 1,
      courseOrgUnitId: 101,
      title: 'A',
      html: null,
      authorName: null,
      postedAt: new Date(),
    });
    const inner = new FakeCommunicationsRepository(new Map([[101, [a]]]));
    const spy = vi.spyOn(inner, 'findAnnouncements');
    const repo = new CachedCommunicationsRepository(inner, new InMemoryCache(), {
      announcementsTtlMs: 60_000,
      discussionsTtlMs: 60_000,
    });
    await repo.findAnnouncements(OrgUnitId.of(101));
    await repo.findAnnouncements(OrgUnitId.of(101));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('caches discussions', async () => {
    const forum = new DiscussionForum({ id: 100, name: 'Main', topics: [] });
    const inner = new FakeCommunicationsRepository(new Map(), new Map([[101, [forum]]]));
    const spy = vi.spyOn(inner, 'findDiscussions');
    const repo = new CachedCommunicationsRepository(inner, new InMemoryCache(), {
      announcementsTtlMs: 60_000,
      discussionsTtlMs: 60_000,
    });
    await repo.findDiscussions(OrgUnitId.of(101));
    await repo.findDiscussions(OrgUnitId.of(101));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
