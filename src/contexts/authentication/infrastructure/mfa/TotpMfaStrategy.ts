import { authenticator } from 'otplib';
import type {
  MfaStrategy,
  MfaChallenge,
  MfaResponse,
} from '@/contexts/authentication/domain/MfaStrategy.js';
import type { SecretValue } from '@/contexts/authentication/domain/SecretValue.js';

export interface TotpMfaStrategyOptions {
  secret: SecretValue;
  digits: 6 | 8;
  period: number;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
}

// otplib's AuthenticatorOptions.algorithm is typed as the HashAlgorithms enum,
// whose string values are the lowercase algorithm names. Since otplib v12 does
// not declare `otplib/core` as a TS-visible subpath export, we mirror the
// enum shape locally and cast through it.
type OtpAlgorithm = Parameters<typeof authenticator.clone>[0] extends {
  algorithm?: infer A;
}
  ? A
  : never;

export class TotpMfaStrategy implements MfaStrategy {
  readonly kind = 'totp' as const;

  constructor(private readonly opts: TotpMfaStrategyOptions) {}

  async solve(challenge: MfaChallenge): Promise<MfaResponse> {
    if (challenge.kind !== 'totp_code') {
      throw new Error(
        `TotpMfaStrategy only handles totp_code challenges, got "${challenge.kind}"`,
      );
    }
    const code = authenticator
      .clone({
        digits: this.opts.digits,
        step: this.opts.period,
        algorithm: this.opts.algorithm.toLowerCase() as unknown as OtpAlgorithm,
      })
      .generate(this.opts.secret.reveal());
    return { code };
  }
}
