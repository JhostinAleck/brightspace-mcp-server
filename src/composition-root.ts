import type { Config } from '@/shared-kernel/config/schema.js';
import { StructuredLogger } from '@/shared-kernel/logging/StructuredLogger.js';
import { EnvVarCredentialStore } from '@/contexts/authentication/infrastructure/credential-stores/EnvVarCredentialStore.js';
import { InMemorySessionCache } from '@/contexts/authentication/infrastructure/session-caches/InMemorySessionCache.js';
import { ApiTokenStrategy } from '@/contexts/authentication/infrastructure/strategies/ApiTokenStrategy.js';
import { EnsureAuthenticated } from '@/contexts/authentication/application/EnsureAuthenticated.js';
import { D2lApiClient } from '@/contexts/http-api/D2lApiClient.js';
import { discoverVersions } from '@/contexts/http-api/VersionDiscovery.js';
import { callWhoAmI } from '@/contexts/http-api/whoami.js';
import { D2lCourseRepository } from '@/contexts/courses/infrastructure/D2lCourseRepository.js';
import type { ToolDeps } from '@/mcp/registry.js';

export interface BuildDependenciesInput {
  config: Config;
}

export async function buildDependencies(input: BuildDependenciesInput): Promise<ToolDeps> {
  const { config } = input;
  const profileName = config.default_profile;
  const profile = config.profiles[profileName];
  if (!profile) throw new Error(`Profile "${profileName}" not defined in config`);
  if (!profile.base_url) throw new Error(`Profile "${profileName}" missing base_url`);
  if (profile.auth.strategy !== 'api_token') {
    throw new Error(`Plan 1 only supports api_token strategy. Got "${profile.auth.strategy}".`);
  }
  if (!profile.auth.api_token?.token_ref) throw new Error('api_token.token_ref is required');

  const logger = new StructuredLogger(config.logging.level);
  const baseUrl = profile.base_url;
  const credStore = new EnvVarCredentialStore(process.env);
  const sessionCache = new InMemorySessionCache();

  const strategy = new ApiTokenStrategy({
    tokenRef: profile.auth.api_token.token_ref,
    credentialStore: credStore,
    whoami: (token) => callWhoAmI(token, baseUrl),
  });
  const ensureAuth = new EnsureAuthenticated(sessionCache, strategy);

  const apiClient = new D2lApiClient({
    baseUrl,
    getToken: async () => (await ensureAuth.execute({ profile: profileName, baseUrl })).token,
  });

  const versions = await discoverVersions(baseUrl);
  logger.info('Discovered D2L API versions', { lp: versions.lp, le: versions.le });

  const courseRepo = new D2lCourseRepository(apiClient, { le: versions.le });

  return {
    ensureAuth,
    profile: profileName,
    baseUrl,
    courseRepo,
  };
}
