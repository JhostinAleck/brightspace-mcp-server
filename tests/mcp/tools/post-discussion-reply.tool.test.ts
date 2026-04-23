import { describe, expect, it } from 'vitest';

import {
  handlePostDiscussionReply,
  type PostDiscussionReplyParams,
} from '@/mcp/tools/post-discussion-reply.tool.js';
import type { CommunicationsRepository } from '@/contexts/communications/domain/CommunicationsRepository.js';
import { InMemoryIdempotencyStore } from '@/shared-kernel/idempotency/IdempotencyStore.js';
import { AuditLogger } from '@/shared-kernel/audit/AuditLogger.js';
import { WritesGate } from '@/shared-kernel/writes/WritesGate.js';

function makeDeps(
  gate: WritesGate,
  postReplyImpl: CommunicationsRepository['postReply'] = async () => ({
    postId: 'p-1',
    postedAt: new Date('2026-04-23T10:00:00Z'),
  }),
) {
  const repo: CommunicationsRepository = {
    findAnnouncements: async () => [],
    findDiscussions: async () => [],
    postReply: postReplyImpl,
    markAnnouncementRead: async () => {},
  };
  return {
    communicationsRepo: repo,
    idempotencyStore: new InMemoryIdempotencyStore(),
    auditLogger: new AuditLogger({
      logger: { warn: () => undefined } as never,
    }),
    writesGate: gate,
  };
}

const sampleParams: PostDiscussionReplyParams = {
  course_id: '100',
  forum_id: 'f1',
  topic_id: 't1',
  body: 'Thanks for the clarification!',
  idempotency_key: 'idem-reply-12345',
};

describe('handlePostDiscussionReply', () => {
  it('posts reply and returns post id on first call', async () => {
    const deps = makeDeps(new WritesGate({ configEnabled: true, cliFlag: true }));
    const result = await handlePostDiscussionReply(sampleParams, deps);
    expect(result.content[0]?.text).toContain('p-1');
  });

  it('returns cached response on idempotent replay', async () => {
    let calls = 0;
    const deps = makeDeps(
      new WritesGate({ configEnabled: true, cliFlag: true }),
      async () => {
        calls++;
        return { postId: `p-${calls}`, postedAt: new Date() };
      },
    );
    const r1 = await handlePostDiscussionReply(sampleParams, deps);
    const r2 = await handlePostDiscussionReply(sampleParams, deps);
    expect(calls).toBe(1);
    expect(r1.content[0]?.text).toContain('p-1');
    expect(r2.content[0]?.text).toContain('replay');
  });

  it('returns dry-run preview when writesGate.isDryRun is true', async () => {
    let calls = 0;
    const deps = makeDeps(
      new WritesGate({ configEnabled: true, cliFlag: true, configDryRun: true }),
      async () => {
        calls++;
        return { postId: 'p-x', postedAt: new Date() };
      },
    );
    const result = await handlePostDiscussionReply(sampleParams, deps);
    expect(calls).toBe(0);
    expect(result.content[0]?.text).toContain('[dry-run]');
  });
});
