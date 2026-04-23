export interface AuthOptions {
  profile?: string;
  config?: string;
}

export async function runAuth(_opts: AuthOptions): Promise<void> {
  throw new Error('auth command not yet implemented');
}
