export interface CacheClearOptions {
  profile?: string;
  config?: string;
  context?: string;
}

export async function runCacheClear(_opts: CacheClearOptions): Promise<void> {
  throw new Error('cache clear not yet implemented');
}
