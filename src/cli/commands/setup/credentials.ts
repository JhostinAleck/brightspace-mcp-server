export type SecretRefStrategy =
  | { strategy: 'env'; varName: string }
  | { strategy: 'file'; path: string }
  | { strategy: 'keychain'; service: string; key: string };

export function chooseSecretRef(opts: SecretRefStrategy): string {
  switch (opts.strategy) {
    case 'env':
      return `env:${opts.varName}`;
    case 'file':
      return `file:${opts.path}`;
    case 'keychain':
      return `keychain:${opts.service}/${opts.key}`;
    default: {
      const _exhaustive: never = opts;
      throw new Error(`unknown secret ref strategy: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
