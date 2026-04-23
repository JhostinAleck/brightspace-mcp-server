export type GradeItemKind = 'numeric' | 'passfail' | 'letter' | 'other';

export interface GradeItemProps {
  id: number;
  name: string;
  kind: GradeItemKind;
  maxPoints: number;
  weight?: number;
}

export class GradeItem {
  constructor(private readonly props: GradeItemProps) {}
  get id(): number { return this.props.id; }
  get name(): string { return this.props.name; }
  get kind(): GradeItemKind { return this.props.kind; }
  get maxPoints(): number { return this.props.maxPoints; }
  get weight(): number | undefined { return this.props.weight; }
}
