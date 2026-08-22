import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import {
  addAppleAccount,
  getAppleAccounts,
  removeAppleAccount,
  toPublicAppleAccount,
  type AppleAccount,
} from "@/lib/apple-accounts";
import { isAppleMusicConfigured } from "@/lib/apple-music";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  return NextResponse.json({
    accounts: getAppleAccounts().map(toPublicAppleAccount),
    configured: isAppleMusicConfigured(),
  });
}

// Called by the client after MusicKit JS's authorize() resolves with a
// music user token — there's no server-side OAuth redirect for Apple Music.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { musicUserToken, label } = await req.json().catch(() => ({}));
  if (!musicUserToken || typeof musicUserToken !== "string") {
    return NextResponse.json({ error: "musicUserToken is required" }, { status: 400 });
  }

  const account: AppleAccount = {
    id: crypto.randomUUID(),
    label: typeof label === "string" && label.trim() ? label.trim() : "Apple Music account",
    musicUserToken,
    connectedAt: new Date().toISOString(),
  };

  const accounts = addAppleAccount(account);
  return NextResponse.json({ accounts: accounts.map(toPublicAppleAccount) });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const remaining = removeAppleAccount(id);
  return NextResponse.json({ accounts: remaining.map(toPublicAppleAccount) });
}
