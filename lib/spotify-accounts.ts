import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";

// Connected Spotify accounts, on top of the primary NextAuth session.
// Stored as an encrypted, httpOnly cookie since this app has no database —
// tokens never reach client JS or localStorage.

export type SpotifyAccount = {
  id: string;
  spotifyUserId: string;
  displayName: string;
  image?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // seconds since epoch
  connectedAt: string;
};

export type PublicSpotifyAccount = Omit<SpotifyAccount, "accessToken" | "refreshToken">;

const COOKIE_NAME = "rtm.spotify_accounts";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export function toPublicAccount(a: SpotifyAccount): PublicSpotifyAccount {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accessToken, refreshToken, ...pub } = a;
  return pub;
}

export function getConnectedAccounts(): SpotifyAccount[] {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    const decrypted = decrypt(raw);
    const parsed = JSON.parse(decrypted);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConnectedAccounts(accounts: SpotifyAccount[]): void {
  cookies().set(COOKIE_NAME, encrypt(JSON.stringify(accounts)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
    maxAge: COOKIE_MAX_AGE,
  });
}

export function upsertAccount(account: SpotifyAccount): SpotifyAccount[] {
  const existing = getConnectedAccounts();
  const withoutDupe = existing.filter((a) => a.spotifyUserId !== account.spotifyUserId);
  const next = [...withoutDupe, account];
  saveConnectedAccounts(next);
  return next;
}

export function removeAccount(id: string): SpotifyAccount[] {
  const next = getConnectedAccounts().filter((a) => a.id !== id);
  saveConnectedAccounts(next);
  return next;
}

async function refreshAccessToken(account: SpotifyAccount): Promise<SpotifyAccount> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
    }),
  });
  const refreshed = await res.json();
  if (!res.ok) throw new Error(refreshed.error_description ?? "Failed to refresh Spotify token");

  return {
    ...account,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? account.refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
  };
}

// Returns accounts with valid, non-expired access tokens — refreshing and
// persisting any that have expired. Accounts whose refresh fails are dropped.
export async function getFreshAccounts(): Promise<SpotifyAccount[]> {
  const accounts = getConnectedAccounts();
  if (accounts.length === 0) return [];

  const now = Math.floor(Date.now() / 1000);
  let changed = false;
  const results: SpotifyAccount[] = [];

  for (const account of accounts) {
    if (account.expiresAt - now > 60) {
      results.push(account);
      continue;
    }
    try {
      const refreshed = await refreshAccessToken(account);
      results.push(refreshed);
      changed = true;
    } catch {
      changed = true; // drop the account — refresh token is dead
    }
  }

  if (changed) saveConnectedAccounts(results);
  return results;
}
