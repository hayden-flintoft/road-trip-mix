import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getFreshAccounts, removeAccount, toPublicAccount } from "@/lib/spotify-accounts";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const accounts = await getFreshAccounts();
  const primary = {
    id: "primary",
    spotifyUserId: "primary",
    displayName: session.user.name ? `${session.user.name} (you)` : "You",
    image: session.user.image ?? undefined,
    connectedAt: "",
    isPrimary: true,
  };

  return NextResponse.json({ accounts: [primary, ...accounts.map(toPublicAccount)] });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  if (id === "primary") return NextResponse.json({ error: "Cannot disconnect your primary account" }, { status: 400 });

  const remaining = removeAccount(id);
  return NextResponse.json({ accounts: remaining.map(toPublicAccount) });
}
