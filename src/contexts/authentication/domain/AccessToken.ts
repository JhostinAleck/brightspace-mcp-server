import { SecretValue } from './SecretValue.js';

export type AccessTokenKind = 'bearer' | 'cookie';

export interface AccessTokenJson {
  readonly kind: AccessTokenKind;
  readonly secret: string;
}

export class AccessToken {
  constructor(
    readonly kind: AccessTokenKind,
    private readonly secret: SecretValue,
  ) {}
  static bearer(raw: string): AccessToken {
    return new AccessToken('bearer', new SecretValue(raw));
  }
  static cookie(raw: string): AccessToken {
    return new AccessToken('cookie', new SecretValue(raw));
  }
  reveal(): string {
    return this.secret.reveal();
  }
  toAuthHeader(): { name: string; value: string } {
    return this.kind === 'bearer'
      ? { name: 'Authorization', value: `Bearer ${this.secret.reveal()}` }
      : { name: 'Cookie', value: this.secret.reveal() };
  }
  toPersistable(): AccessTokenJson {
    return { kind: this.kind, secret: this.secret.reveal() };
  }
  static fromPersistable(json: AccessTokenJson): AccessToken {
    return new AccessToken(json.kind, new SecretValue(json.secret));
  }
}
