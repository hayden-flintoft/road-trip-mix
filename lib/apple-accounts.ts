import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";

// Connected Apple Music accounts. Unlike Spotify, there's no server-side
// OAuth redirect: the browser authorizes via MusicKit JS and hands us a
// "music user token" directly, which we store the same way as Spotify
// tokens — encrypted, httpOnly cookie, no database in this app.

export type AppleAccount = {
  id: string;
  label: string;
  musicUserToken: string;
  connectedAt: string;
};

export type PublicAppleAccount = Omit<AppleAccount, "musicUserToken">;

const COOKIE_NAME = "rtm.apple_accounts";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export function toPublicAppleAccount(a: AppleAccount): PublicAppleAccount {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { musicUserToken, ...pub } = a;
  return pub;
}

export function getAppleAccounts(): AppleAccount[] {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decrypt(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAppleAccounts(accounts: AppleAccount[]): void {
  cookies().set(COOKIE_NAME, encrypt(JSON.stringify(accounts)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
    maxAge: COOKIE_MAX_AGE,
  });
}

export function addAppleAccount(account: AppleAccount): AppleAccount[] {
  const next = [...getAppleAccounts(), account];
  saveAppleAccounts(next);
  return next;
}

export function removeAppleAccount(id: string): AppleAccount[] {
  const next = getAppleAccounts().filter((a) => a.id !== id);
  saveAppleAccounts(next);
  return next;
}
