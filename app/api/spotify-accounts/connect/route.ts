import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";

const SPOTIFY_ACCOUNT_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
].join(" ");

const STATE_COOKIE = "rtm.spotify_connect_state";

// Kicks off the OAuth flow for linking an *additional* Spotify account.
// Kept separate from NextAuth's own provider flow so signing in with a
// second Spotify account doesn't clobber the primary session.
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  cookies().set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/spotify-accounts/callback`;

  const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", process.env.SPOTIFY_CLIENT_ID!);
  authorizeUrl.searchParams.set("scope", SPOTIFY_ACCOUNT_SCOPES);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("show_dialog", "true");

  return NextResponse.redirect(authorizeUrl.toString());
}
