import { LetterGrade } from './LetterGrade.js';

export interface GradeProps {
  itemId: number;
  itemName: string;
  pointsEarned: number | null;
  pointsMax: number;
  percent: number | null;
  displayedGrade: string | null;
}

export class Grade {
  constructor(private readonly props: GradeProps) {}
  get itemId(): number { return this.props.itemId; }
  get itemName(): string { return this.props.itemName; }
  get pointsEarned(): number | null { return this.props.pointsEarned; }
  get pointsMax(): number { return this.props.pointsMax; }
  get percent(): number | null { return this.props.percent; }
  get displayedGrade(): string | null { return this.props.displayedGrade; }

  get letter(): LetterGrade | null {
    return this.props.percent === null ? null : LetterGrade.fromPercent(this.props.percent);
  }
}
