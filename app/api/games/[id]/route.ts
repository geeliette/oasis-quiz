import { NextRequest, NextResponse } from "next/server";
import { getGame, saveGame } from "@/lib/store";
import type { Game, GameUpdate } from "@/lib/types";
import { MAX_BODY_BYTES, findInvalidTimeLimits, findTooLongFields } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const game = await getGame(id);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load game" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const tooLarge = NextResponse.json({ error: "Game is too large to save" }, { status: 413 });
  if (Number(req.headers.get("content-length")) > MAX_BODY_BYTES) return tooLarge;

  let body: GameUpdate;
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return tooLarge;
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || (body.categories !== undefined && !Array.isArray(body.categories))) {
    return NextResponse.json({ error: "Invalid game data" }, { status: 400 });
  }

  const invalidTimers = findInvalidTimeLimits(body);
  if (invalidTimers.length > 0) {
    return NextResponse.json({ error: "Invalid timer setting", fields: invalidTimers }, { status: 400 });
  }

  try {
    const existing = await getGame(id, { refreshExpiry: false });

    const tooLong = findTooLongFields(body, existing);
    if (tooLong.length > 0) {
      return NextResponse.json({ error: "Some text is over the length limit", fields: tooLong }, { status: 422 });
    }
    const now = Date.now();

    const game: Game = {
      id,
      title: body.title ?? existing?.title ?? "",
      categories: body.categories ?? existing?.categories ?? [],
      teams: body.teams ?? existing?.teams ?? [],
      defaultTimeLimit: body.defaultTimeLimit ?? existing?.defaultTimeLimit,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await saveGame(game);
    return NextResponse.json(game);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save game" },
      { status: 500 }
    );
  }
}
