import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { upsertAccount, type SpotifyAccount } from "@/lib/spotify-accounts";

const STATE_COOKIE = "rtm.spotify_connect_state";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const redirectHome = (query: string) => NextResponse.redirect(`${url.origin}/?${query}`);

  if (!session?.user) return redirectHome("account_error=signed_out");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const expectedState = cookies().get(STATE_COOKIE)?.value;
  cookies().delete(STATE_COOKIE);

  if (error) return redirectHome(`account_error=${encodeURIComponent(error)}`);
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectHome("account_error=invalid_state");
  }

  const redirectUri = `${url.origin}/api/spotify-accounts/callback`;

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) return redirectHome("account_error=token_exchange_failed");

  const meRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const me = await meRes.json();
  if (!meRes.ok) return redirectHome("account_error=profile_fetch_failed");

  const account: SpotifyAccount = {
    id: crypto.randomUUID(),
    spotifyUserId: me.id,
    displayName: me.display_name ?? me.id,
    image: me.images?.[0]?.url,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + tokenData.expires_in,
    connectedAt: new Date().toISOString(),
  };

  upsertAccount(account);
  return redirectHome("account_connected=1");
}
