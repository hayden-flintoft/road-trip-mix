"use client";

import { signIn, signOut } from "next-auth/react";

export default function LoginButton({ signedIn }: { signedIn?: boolean }) {
  if (signedIn) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
        className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-full border border-white/30 text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("spotify")}
      className="px-8 py-3 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors"
    >
      Login with Spotify
    </button>
  );
}
