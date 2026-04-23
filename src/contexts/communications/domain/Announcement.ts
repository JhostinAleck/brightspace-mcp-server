export interface AnnouncementProps {
  id: number;
  courseOrgUnitId: number;
  title: string;
  html: string | null;
  authorName: string | null;
  postedAt: Date;
}

export class Announcement {
  constructor(private readonly props: AnnouncementProps) {}
  get id(): number { return this.props.id; }
  get courseOrgUnitId(): number { return this.props.courseOrgUnitId; }
  get title(): string { return this.props.title; }
  get html(): string | null { return this.props.html; }
  get authorName(): string | null { return this.props.authorName; }
  get postedAt(): Date { return this.props.postedAt; }
}
