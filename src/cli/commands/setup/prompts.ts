import { input, password, select } from '@inquirer/prompts';

export function validateBaseUrl(value: string): true | string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return 'not a valid URL';
  }
  if (url.protocol === 'https:') return true;
  if (url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    return true;
  }
  return 'base URL must be https:// (or http://localhost for local testing)';
}

const BASE32_ALPHABET = /^[A-Z2-7]+=*$/;

export function validateTotpSecret(value: string): true | string {
  const compact = value.replace(/\s+/g, '').toUpperCase();
  if (!BASE32_ALPHABET.test(compact)) return 'TOTP secret must be base32 (A-Z, 2-7)';
  if (compact.replace(/=+$/, '').length < 16) return 'TOTP secret looks too short';
  return true;
}

export async function promptBaseUrl(): Promise<string> {
  return input({
    message: 'Brightspace base URL (e.g. https://school.brightspace.com):',
    validate: validateBaseUrl,
  });
}

export async function promptAuthStrategy(): Promise<string> {
  return select({
    message: 'Auth strategy:',
    choices: [
      { name: 'API Token (simplest, requires Valence token)', value: 'api_token' },
      { name: 'Browser (Playwright, solves MFA interactively)', value: 'browser' },
      { name: 'Session Cookie (paste cookies from browser)', value: 'session_cookie' },
      { name: 'OAuth (Authorization Code + PKCE)', value: 'oauth' },
      { name: 'Headless Password (username + password, advanced)', value: 'headless_password' },
    ],
  });
}

export async function promptApiToken(): Promise<string> {
  return password({ message: 'Paste your Valence API token:', mask: '*' });
}

export async function promptMfaStrategy(): Promise<string> {
  return select({
    message: 'MFA strategy:',
    choices: [
      { name: 'None (no MFA required)', value: 'none' },
      { name: 'TOTP (RFC 6238 — authenticator app)', value: 'totp' },
      { name: 'Duo Push (poll for mobile approval)', value: 'duo_push' },
      { name: 'Manual Prompt (paste code when asked)', value: 'manual_prompt' },
    ],
  });
}

export async function promptTotpSecret(): Promise<string> {
  return password({
    message: 'TOTP secret (base32, from QR code or setup key):',
    mask: '*',
    validate: validateTotpSecret,
  });
}
