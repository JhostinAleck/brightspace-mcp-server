import { parse as parseYaml } from 'yaml';
import type { Config } from './schema.js';
import { ConfigSchema } from './schema.js';
import { DEFAULT_CONFIG } from './defaults.js';

export interface LoadConfigInput {
  fileContent: string | null;
  env: Record<string, string | undefined>;
  cliOverrides: Partial<Config>;
}

function deepMerge<T>(base: T, override: Partial<T>): T {
  if (override === null || override === undefined) return base;
  if (typeof base !== 'object' || base === null) return ((override as T) ?? base) as T;
  const isArray = Array.isArray(base);
  const out = (
    isArray ? [...(base as unknown[])] : { ...(base as Record<string, unknown>) }
  ) as Record<string, unknown>;
  const baseObj = base as Record<string, unknown>;
  const overrideObj = override as Record<string, unknown>;
  for (const k of Object.keys(overrideObj)) {
    const ov = overrideObj[k];
    const bv = baseObj[k];
    out[k] =
      ov !== null &&
      typeof ov === 'object' &&
      !Array.isArray(ov) &&
      typeof bv === 'object' &&
      bv !== null
        ? deepMerge(bv, ov as Partial<typeof bv>)
        : ov;
  }
  return out as T;
}

export function loadConfig(input: LoadConfigInput): Config {
  const fromFile = input.fileContent ? (parseYaml(input.fileContent) as Partial<Config>) : {};
  const merged = deepMerge(deepMerge(DEFAULT_CONFIG, fromFile), input.cliOverrides);
  return ConfigSchema.parse(merged);
}
