export interface DiscussionTopicProps {
  id: number;
  name: string;
  description: string | null;
  postCount: number;
  lastPostAt: Date | null;
}

export class DiscussionTopic {
  constructor(private readonly props: DiscussionTopicProps) {}
  get id(): number { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string | null { return this.props.description; }
  get postCount(): number { return this.props.postCount; }
  get lastPostAt(): Date | null { return this.props.lastPostAt; }
}
