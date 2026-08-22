import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { generateDeveloperToken, isAppleMusicConfigured } from "@/lib/apple-music";

// Issues the Apple Music developer token MusicKit JS needs client-side to
// initialize and run the user authorization flow.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  if (!isAppleMusicConfigured()) {
    return NextResponse.json({ error: "Apple Music is not configured on this server" }, { status: 501 });
  }

  try {
    return NextResponse.json({ token: generateDeveloperToken() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate developer token" },
      { status: 500 }
    );
  }
}
