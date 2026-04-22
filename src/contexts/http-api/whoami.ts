import type { AccessToken } from '@/contexts/authentication/domain/AccessToken.js';
import type { UserIdentity } from '@/contexts/authentication/domain/UserIdentity.js';
import { UserId } from '@/shared-kernel/types/UserId.js';

interface WhoAmIResponse {
  Identifier: string;
  FirstName: string;
  LastName: string;
  UniqueName: string;
}

export async function callWhoAmI(
  token: AccessToken,
  baseUrl: string,
  lpVersion = '1.56',
): Promise<UserIdentity> {
  const { name, value } = token.toAuthHeader();
  const resp = await fetch(
    `${baseUrl.replace(/\/$/, '')}/d2l/api/lp/${lpVersion}/users/whoami`,
    {
      headers: { [name]: value },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!resp.ok) throw new Error(`whoami failed: ${resp.status}`);
  const body = (await resp.json()) as WhoAmIResponse;
  return {
    userId: UserId.of(parseInt(body.Identifier, 10)),
    displayName: `${body.FirstName} ${body.LastName}`.trim(),
    uniqueName: body.UniqueName,
  };
}
