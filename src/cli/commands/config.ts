export interface ConfigShowOptions {
  config?: string;
  resolved?: boolean;
}

export interface ConfigValidateOptions {
  config?: string;
}

export interface ConfigSetOptions {
  config?: string;
}

export async function runConfigShow(_opts: ConfigShowOptions): Promise<void> {
  throw new Error('config show not yet implemented');
}

export async function runConfigValidate(_opts: ConfigValidateOptions): Promise<void> {
  throw new Error('config validate not yet implemented');
}

export async function runConfigSet(_path: string, _value: string, _opts: ConfigSetOptions): Promise<void> {
  throw new Error('config set not yet implemented');
}
