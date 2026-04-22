const PATTERNS: Array<[RegExp, string]> = [
  [/\b[A-Z2-7]{16,32}\b/g, '[REDACTED]'],
  [/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]'],
  [/Cookie:\s*[^\r\n]+/gi, 'Cookie: [REDACTED]'],
];

export function redactSecrets(input: string): string {
  let out = input;
  for (const [re, replacement] of PATTERNS) out = out.replace(re, replacement);
  return out;
}
