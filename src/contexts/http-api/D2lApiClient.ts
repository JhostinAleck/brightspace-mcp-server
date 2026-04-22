import type { AccessToken } from '@/contexts/authentication/domain/AccessToken.js';
import { D2lApiError, NetworkError } from './errors.js';

export interface D2lApiClientOptions {
  baseUrl: string;
  getToken: () => Promise<AccessToken>;
  timeoutMs?: number;
  userAgent?: string;
}

const DEFAULT_UA =
  'brightspace-mcp/0.1.0 (+https://github.com/JhostinAleck/brightspace-mcp)';

export class D2lApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly userAgent: string;

  constructor(private readonly opts: D2lApiClientOptions) {
    if (opts.baseUrl.startsWith('http://')) throw new Error('HTTPS required for D2L API');
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.userAgent = opts.userAgent ?? DEFAULT_UA;
  }

  async get<T>(path: string): Promise<T> {
    const token = await this.opts.getToken();
    const { name, value } = token.toAuthHeader();

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: { [name]: value, 'User-Agent': this.userAgent },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      throw new NetworkError(`GET ${path} failed`, err instanceof Error ? err : undefined);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new D2lApiError(response.status, path, body);
    }
    return (await response.json()) as T;
  }
}
