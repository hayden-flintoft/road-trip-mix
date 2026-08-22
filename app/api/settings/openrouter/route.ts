import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { clearOpenRouterKey, getOpenRouterStatus, saveOpenRouterKey } from "@/lib/openrouter-key";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  return NextResponse.json(getOpenRouterStatus());
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { apiKey } = await req.json().catch(() => ({}));
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return NextResponse.json({ error: "apiKey is required" }, { status: 400 });
  }

  saveOpenRouterKey(apiKey.trim(), "manual");
  return NextResponse.json(getOpenRouterStatus());
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  clearOpenRouterKey();
  return NextResponse.json(getOpenRouterStatus());
}
