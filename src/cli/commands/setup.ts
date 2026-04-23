export interface SetupOptions {
  config?: string;
  skipClientDetection?: boolean;
}

export async function runSetup(_opts: SetupOptions): Promise<void> {
  throw new Error('setup wizard not yet implemented');
}
