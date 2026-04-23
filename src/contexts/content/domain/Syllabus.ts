export interface SyllabusProps {
  courseOrgUnitId: number;
  title: string;
  html: string | null;
  updatedAt: Date | null;
  sourceUrl: string | null;
}

export class Syllabus {
  constructor(private readonly props: SyllabusProps) {}
  get courseOrgUnitId(): number { return this.props.courseOrgUnitId; }
  get title(): string { return this.props.title; }
  get html(): string | null { return this.props.html; }
  get updatedAt(): Date | null { return this.props.updatedAt; }
  get sourceUrl(): string | null { return this.props.sourceUrl; }
}
