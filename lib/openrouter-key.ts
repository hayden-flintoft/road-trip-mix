import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";

// A user's personal OpenRouter API key, connected either via OAuth PKCE or
// pasted manually in Settings. Stored the same way as Spotify accounts —
// encrypted, httpOnly cookie — since this app has no database. Falls back
// to the server-wide OPENROUTER_API_KEY env var when no personal key is set.

const KEY_COOKIE = "rtm.openrouter_key";
const SOURCE_COOKIE = "rtm.openrouter_key_source";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export type OpenRouterKeySource = "oauth" | "manual";

const secureCookie = () => process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;

export function saveOpenRouterKey(key: string, source: OpenRouterKeySource): void {
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: secureCookie(),
    maxAge: COOKIE_MAX_AGE,
  };
  cookies().set(KEY_COOKIE, encrypt(key), opts);
  cookies().set(SOURCE_COOKIE, source, opts);
}

export function clearOpenRouterKey(): void {
  cookies().delete(KEY_COOKIE);
  cookies().delete(SOURCE_COOKIE);
}

function getPersonalKey(): { key: string; source: OpenRouterKeySource } | null {
  const raw = cookies().get(KEY_COOKIE)?.value;
  if (!raw) return null;
  try {
    const source = (cookies().get(SOURCE_COOKIE)?.value as OpenRouterKeySource) ?? "manual";
    return { key: decrypt(raw), source };
  } catch {
    return null;
  }
}

// Status for the Settings UI: never exposes the key itself.
export function getOpenRouterStatus(): {
  connected: boolean;
  source: OpenRouterKeySource | "env" | null;
} {
  const personal = getPersonalKey();
  if (personal) return { connected: true, source: personal.source };
  if (process.env.OPENROUTER_API_KEY) return { connected: true, source: "env" };
  return { connected: false, source: null };
}

// The key to actually use for a request: personal key takes priority over
// the shared server-wide env var key.
export function resolveOpenRouterKey(): string | null {
  return getPersonalKey()?.key ?? process.env.OPENROUTER_API_KEY ?? null;
}
