export interface SecretResolverOptions {
  env: Record<string, string | undefined>;
  allowLiteral: boolean;
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
        if (!this.opts.allowLiteral)
          throw new Error('literal: refs disallowed. Use --allow-literal-secrets to override.');
        return rest;
      // 'keychain' and 'file' added in Plan 2
      default:
        throw new Error(`Unknown secret ref scheme: "${scheme}"`);
    }
  }
}
