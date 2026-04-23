import type { DiscussionTopic } from './DiscussionTopic.js';

export interface DiscussionForumProps {
  id: number;
  name: string;
  topics: DiscussionTopic[];
}

export class DiscussionForum {
  constructor(private readonly props: DiscussionForumProps) {}
  get id(): number { return this.props.id; }
  get name(): string { return this.props.name; }
  get topics(): readonly DiscussionTopic[] { return this.props.topics; }
}
