export type MfaStrategyKind = 'none' | 'totp' | 'duo_push' | 'manual_prompt';

export type MfaChallengeKind = 'totp_code' | 'duo_push' | 'prompt_text';

export interface MfaChallenge {
  readonly kind: MfaChallengeKind;
  readonly promptText?: string;
  readonly duoTransactionUrl?: string;
}

export interface MfaResponse {
  readonly code?: string;
  readonly acknowledged?: boolean;
}

export interface MfaStrategy {
  readonly kind: MfaStrategyKind;
  solve(challenge: MfaChallenge): Promise<MfaResponse>;
}
