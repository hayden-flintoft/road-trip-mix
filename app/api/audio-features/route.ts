import { NextRequest, NextResponse } from "next/server";
import { getCachedSongBpm } from "@/app/(pages)/playlist/[id]/cache";

export async function POST(req: NextRequest) {
  try {
    const { tracks } = (await req.json()) as { tracks: { name: string; artist: string }[] };
    const features = await Promise.all(
      tracks.map(({ name, artist }) => getCachedSongBpm(name, artist))
    );
    return NextResponse.json({ features });
  } catch {
    return NextResponse.json({ features: [] }, { status: 500 });
  }
}
