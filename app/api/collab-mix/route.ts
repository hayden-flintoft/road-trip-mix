import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getFreshAccounts } from "@/lib/spotify-accounts";
import { getAccountFavorites } from "@/lib/spotify-library";
import { mergeFavorites, type MergedTrack } from "@/lib/collab-mix";
import { generateAiMix } from "@/lib/openrouter";
import { resolveOpenRouterKey } from "@/lib/openrouter-key";

type RequestBody = {
  accountIds?: string[];
  perAccount?: number;
  useAi?: boolean;
  vibe?: string;
  targetCount?: number;
  createPlaylist?: boolean;
  playlistName?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const body: RequestBody = await req.json().catch(() => ({}));
  const perAccount = body.perAccount ?? 15;
  const targetCount = body.targetCount ?? 20;

  const connectedAccounts = await getFreshAccounts();
  const wantedIds = body.accountIds?.length ? new Set(body.accountIds) : null;

  const selected = wantedIds
    ? connectedAccounts.filter((a) => wantedIds.has(a.id))
    : connectedAccounts;
  const includePrimary = !wantedIds || wantedIds.has("primary");

  if (selected.length === 0 && !includePrimary) {
    return NextResponse.json(
      { error: "No accounts selected. Pick at least one Spotify account to build a mix from." },
      { status: 400 }
    );
  }

  const accountFavorites = await Promise.all([
    ...(includePrimary
      ? [
          (async () => ({
            accountId: "primary",
            label: session.user?.name ?? "You",
            tracks: await getAccountFavorites(session.accessToken!),
          }))(),
        ]
      : []),
    ...selected.map(async (account) => ({
      accountId: account.id,
      label: account.displayName,
      tracks: await getAccountFavorites(account.accessToken),
    })),
  ]);

  const merged = mergeFavorites(accountFavorites, perAccount);

  let finalTracks: MergedTrack[];
  let aiTitle: string | undefined;
  let aiNote: string | undefined;

  if (body.useAi) {
    try {
      const aiResult = await generateAiMix(
        merged.map((t) => ({
          id: t.id,
          name: t.name,
          artists: t.artists.map((a) => a.name).join(", "),
          fromAccounts: t.fromAccounts,
        })),
        body.vibe ?? "",
        targetCount,
        undefined,
        resolveOpenRouterKey()
      );
      const byId = new Map(merged.map((t) => [t.id, t]));
      const ordered = aiResult.trackIds.map((id) => byId.get(id)).filter((t): t is MergedTrack => !!t);
      finalTracks = ordered.length > 0 ? ordered : merged.slice(0, targetCount);
      aiTitle = aiResult.title;
      aiNote = aiResult.note;
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "AI mix generation failed" },
        { status: 502 }
      );
    }
  } else {
    finalTracks = merged.slice(0, targetCount);
  }

  if (!body.createPlaylist) {
    return NextResponse.json({
      tracks: finalTracks,
      suggestedName: aiTitle,
      aiNote,
      accounts: accountFavorites.map((a) => ({ id: a.accountId, displayName: a.label })),
    });
  }

  const meRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const me = await meRes.json();
  if (!meRes.ok) {
    return NextResponse.json({ error: "Could not resolve your Spotify profile" }, { status: 502 });
  }

  const playlistName =
    body.playlistName?.trim() ||
    aiTitle ||
    `Road Trip Mix — ${new Date().toLocaleDateString()}`;

  const createRes = await fetch(`https://api.spotify.com/v1/users/${me.id}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: playlistName,
      description: `Collaborative mix from ${accountFavorites.map((a) => a.label).join(", ")}`,
      public: false,
    }),
  });
  const playlist = await createRes.json();
  if (!createRes.ok) {
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 502 });
  }

  const uris = finalTracks.map((t) => t.uri).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < uris.length; i += 100) chunks.push(uris.slice(i, i + 100));

  for (const chunk of chunks) {
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: chunk }),
    });
  }

  return NextResponse.json({
    tracks: finalTracks,
    playlist: { id: playlist.id, url: playlist.external_urls?.spotify, name: playlistName },
    aiNote,
  });
}
