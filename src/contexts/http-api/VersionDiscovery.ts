import { NetworkError, D2lApiError } from './errors.js';

export interface ApiVersions {
  lp: string;
  le: string;
}

interface VersionEntry {
  ProductCode: string;
  LatestVersion: string;
}

export async function discoverVersions(baseUrl: string, timeoutMs = 10_000): Promise<ApiVersions> {
  let resp: Response;
  try {
    resp = await fetch(`${baseUrl.replace(/\/$/, '')}/d2l/api/versions/`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new NetworkError('version discovery failed', e instanceof Error ? e : undefined);
  }
  if (!resp.ok) {
    throw new D2lApiError(
      resp.status,
      '/d2l/api/versions/',
      await resp.text().catch(() => ''),
    );
  }
  const list = (await resp.json()) as VersionEntry[];
  const lp = list.find((v) => v.ProductCode.toLowerCase() === 'lp')?.LatestVersion;
  const le = list.find((v) => v.ProductCode.toLowerCase() === 'le')?.LatestVersion;
  if (!lp || !le) {
    throw new Error(`Missing LP or LE version in response: lp=${lp}, le=${le}`);
  }
  return { lp, le };
}
