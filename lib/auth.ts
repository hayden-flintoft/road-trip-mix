import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const SPOTIFY_SCOPES = [
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-playback-state",
].join(" ");

async function refreshAccessToken(token: Record<string, unknown>) {
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
      refresh_token: token.refreshToken as string,
    }),
  });

  const refreshed = await res.json();
  if (!res.ok) throw refreshed;

  return {
    ...token,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? token.refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: { scope: SPOTIFY_SCOPES, show_dialog: true },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }

      // Token still valid
      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Token expired — refresh it
      try {
        return await refreshAccessToken(token);
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};
