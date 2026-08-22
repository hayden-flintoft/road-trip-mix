import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { saveOpenRouterKey } from "@/lib/openrouter-key";

const VERIFIER_COOKIE = "rtm.openrouter_pkce_verifier";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const redirectSettings = (query: string) =>
    NextResponse.redirect(`${url.origin}/settings?${query}`);

  if (!session?.user) return redirectSettings("openrouter_error=signed_out");

  const code = url.searchParams.get("code");
  const codeVerifier = cookies().get(VERIFIER_COOKIE)?.value;
  cookies().delete(VERIFIER_COOKIE);

  if (!code || !codeVerifier) return redirectSettings("openrouter_error=invalid_state");

  const res = await fetch("https://openrouter.ai/api/v1/auth/keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
      code_challenge_method: "S256",
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.key) return redirectSettings("openrouter_error=exchange_failed");

  saveOpenRouterKey(data.key, "oauth");
  return redirectSettings("openrouter_connected=1");
}
