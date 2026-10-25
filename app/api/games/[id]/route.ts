import { NextRequest, NextResponse } from "next/server";
import { getGame, saveGame } from "@/lib/store";
import type { Game, GameUpdate } from "@/lib/types";

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

  let body: GameUpdate;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const existing = await getGame(id);
    const now = Date.now();

    const game: Game = {
      id,
      title: body.title ?? existing?.title ?? "",
      categories: body.categories ?? existing?.categories ?? [],
      teams: body.teams ?? existing?.teams ?? [],
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
