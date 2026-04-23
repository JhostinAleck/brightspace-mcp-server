import type { CredentialStore } from '@/contexts/authentication/domain/CredentialStore.js';

export interface SecretResolverOptions {
  env: Record<string, string | undefined>;
  allowLiteral: boolean;
  credentialStore?: CredentialStore;
}

export class SecretResolver {
  constructor(private readonly opts: SecretResolverOptions) {}

  async resolve(ref: string): Promise<string | null> {
    const idx = ref.indexOf(':');
    if (idx < 0) throw new Error(`Invalid secret ref: "${ref}"`);
    const scheme = ref.slice(0, idx);
    const rest = ref.slice(idx + 1);

    switch (scheme) {
      case 'env':
        return this.opts.env[rest] ?? null;
      case 'literal':
        if (!this.opts.allowLiteral) {
          throw new Error('literal: refs disallowed. Use --allow-literal-secrets to override.');
        }
        return rest;
      case 'keychain':
      case 'file': {
        if (!this.opts.credentialStore) {
          throw new Error(
            `${scheme}: secret refs require a credential store. Configure one in your profile or enable the default CompositeCredentialStore.`,
          );
        }
        const value = await this.opts.credentialStore.get(ref);
        return value ? value.reveal() : null;
      }
      default:
        throw new Error(`Unknown secret ref scheme: "${scheme}"`);
    }
  }
}
