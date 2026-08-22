import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";

// Kicks off OpenRouter's OAuth PKCE flow so the user can connect their own
// OpenRouter account instead of pasting an API key. See:
// https://openrouter.ai/docs/use-cases/oauth-pkce

const VERIFIER_COOKIE = "rtm.openrouter_pkce_verifier";

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash("sha256").update(codeVerifier).digest());

  cookies().set(VERIFIER_COOKIE, codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const origin = new URL(req.url).origin;
  const callbackUrl = `${origin}/api/openrouter/callback`;

  const authorizeUrl = new URL("https://openrouter.ai/auth");
  authorizeUrl.searchParams.set("callback_url", callbackUrl);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("key_label", "Road Trip Mix");

  return NextResponse.redirect(authorizeUrl.toString());
}
