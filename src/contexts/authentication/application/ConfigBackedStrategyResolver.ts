import type { AuthStrategy } from '@/contexts/authentication/domain/AuthStrategy.js';
import type { AuthStrategyKind } from '@/contexts/authentication/domain/Session.js';
import { AuthConfigError } from '@/contexts/authentication/domain/errors.js';
import type { Profile } from '@/shared-kernel/config/schema.js';

export interface AutoDetectSignals {
  apiTokenEnvPresent: boolean;
  sessionCookieConfigured: boolean;
  oauthRefreshTokenStored?: boolean;
  browserRunnable?: boolean;
}

export interface ConfigBackedStrategyResolverOptions {
  profile: Profile;
  strategies: Partial<Record<AuthStrategyKind, AuthStrategy>>;
  autoDetect?: AutoDetectSignals;
}

export class ConfigBackedStrategyResolver {
  constructor(private readonly opts: ConfigBackedStrategyResolverOptions) {}

  resolvePrimary(): AuthStrategy {
    const declared = this.opts.profile.auth.strategy;
    const kind: AuthStrategyKind =
      declared === 'auto' ? this.autoDetectKind() : (declared as AuthStrategyKind);
    return this.lookup(kind);
  }

  resolveFallbacks(): AuthStrategy[] {
    return (this.opts.profile.auth.fallbacks ?? []).map((k) => this.lookup(k as AuthStrategyKind));
  }

  private lookup(kind: AuthStrategyKind): AuthStrategy {
    const strat = this.opts.strategies[kind];
    if (!strat) throw new AuthConfigError(`No strategy registered for kind "${kind}"`);
    return strat;
  }

  private autoDetectKind(): AuthStrategyKind {
    const signals = this.opts.autoDetect ?? {
      apiTokenEnvPresent: false,
      sessionCookieConfigured: false,
    };
    if (signals.apiTokenEnvPresent) return 'api_token';
    if (signals.oauthRefreshTokenStored) return 'oauth';
    if (signals.sessionCookieConfigured) return 'session_cookie';
    if (signals.browserRunnable) return 'browser';
    throw new AuthConfigError(
      'auth.strategy is "auto" but no strategy could be auto-detected. Configure an explicit strategy or provide credentials for one of: api_token, oauth, session_cookie, browser.',
    );
  }
}
