import type { AuthStrategy, AuthContext } from '@/contexts/authentication/domain/AuthStrategy.js';
import type { Session } from '@/contexts/authentication/domain/Session.js';
import type { UserIdentity } from '@/contexts/authentication/domain/UserIdentity.js';
import type { CredentialStore } from '@/contexts/authentication/domain/CredentialStore.js';
import { AccessToken } from '@/contexts/authentication/domain/AccessToken.js';
import { AuthConfigError } from '@/contexts/authentication/domain/errors.js';

export type WhoAmI = (token: AccessToken, baseUrl: string) => Promise<UserIdentity>;

export interface ApiTokenStrategyOptions {
  tokenRef: string;
  credentialStore: CredentialStore;
  whoami: WhoAmI;
  tokenTtlMs?: number;
}

const DEFAULT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export class ApiTokenStrategy implements AuthStrategy {
  readonly kind = 'api_token' as const;

  constructor(private readonly opts: ApiTokenStrategyOptions) {}

  async authenticate(ctx: AuthContext): Promise<Session> {
    const secret = await this.opts.credentialStore.get(this.opts.tokenRef);
    if (!secret) {
      throw new AuthConfigError(
        `API token not found at ref "${this.opts.tokenRef}". Set it before running.`,
      );
    }
    const token = AccessToken.bearer(secret.reveal());
    const identity = await this.opts.whoami(token, ctx.baseUrl);
    const now = new Date();
    return {
      token,
      profile: ctx.profile,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + (this.opts.tokenTtlMs ?? DEFAULT_TTL_MS)),
      source: this.kind,
      userIdentity: identity,
    };
  }

  canRefresh(): boolean {
    return false;
  }
}
