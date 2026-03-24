"use client";

import { signIn, signOut } from "next-auth/react";

export default function LoginButton({ signedIn }: { signedIn?: boolean }) {
  if (signedIn) {
    return (
      <button
        onClick={() => signOut()}
        className="px-6 py-2 rounded-full border border-white/30 text-sm hover:bg-white/10 transition-colors"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("spotify")}
      className="px-8 py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors"
    >
      Login with Spotify
    </button>
  );
}
