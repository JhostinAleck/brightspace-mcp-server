export type LetterGradeKind = 'A' | 'B' | 'C' | 'D' | 'F';

export class LetterGrade {
  private constructor(
    readonly letter: LetterGradeKind,
    readonly percent: number,
  ) {}

  static fromPercent(percent: number): LetterGrade {
    if (percent < 0 || percent > 100) {
      throw new Error(`LetterGrade: percent must be in [0, 100], got ${percent}`);
    }
    let letter: LetterGradeKind;
    if (percent >= 90) letter = 'A';
    else if (percent >= 80) letter = 'B';
    else if (percent >= 70) letter = 'C';
    else if (percent >= 60) letter = 'D';
    else letter = 'F';
    return new LetterGrade(letter, percent);
  }

  get isPassing(): boolean {
    return this.letter !== 'F';
  }
}
