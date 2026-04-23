import type { AuthStrategy, AuthContext } from '@/contexts/authentication/domain/AuthStrategy.js';
import type { SessionCache } from '@/contexts/authentication/domain/SessionCache.js';
import type { Session } from '@/contexts/authentication/domain/Session.js';
import type { ConfigBackedStrategyResolver } from './ConfigBackedStrategyResolver.js';
import { FallbackChainExhaustedError } from '@/contexts/authentication/domain/errors.js';

export class EnsureAuthenticated {
  constructor(
    private readonly cache: SessionCache,
    private readonly resolverOrStrategy: ConfigBackedStrategyResolver | AuthStrategy,
  ) {}

  async execute(ctx: AuthContext): Promise<Session> {
    const cached = await this.cache.get(ctx.profile);
    if (cached) return cached;

    const chain = this.buildChain();
    const failures: Error[] = [];
    for (const strategy of chain) {
      try {
        const fresh = await strategy.authenticate(ctx);
        await this.cache.save(ctx.profile, fresh);
        return fresh;
      } catch (err) {
        failures.push(err instanceof Error ? err : new Error(String(err)));
      }
    }
    const cause = failures[failures.length - 1];
    throw new FallbackChainExhaustedError(
      `All authentication strategies failed: ${failures.map((e) => e.message).join(' | ')}`,
      cause,
    );
  }

  async reauthenticate(ctx: AuthContext): Promise<Session> {
    await this.cache.invalidate(ctx.profile);
    return this.execute(ctx);
  }

  private buildChain(): AuthStrategy[] {
    if ('resolvePrimary' in this.resolverOrStrategy) {
      return [
        this.resolverOrStrategy.resolvePrimary(),
        ...this.resolverOrStrategy.resolveFallbacks(),
      ];
    }
    return [this.resolverOrStrategy];
  }
}
