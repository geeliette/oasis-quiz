import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { DEMO_GAME_ID, buildDemoGame } from "./demo";
import type { Game } from "./types";

const REDIS_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const hasRedis = Boolean(REDIS_URL && REDIS_TOKEN);
const isVercel = Boolean(process.env.VERCEL);

let redis: Redis | null = null;
if (hasRedis) {
  redis = new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "games.json");

async function readFileStore(): Promise<Record<string, Game>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeFileStore(data: Record<string, Game>): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function assertPersistenceAvailable() {
  if (!hasRedis && isVercel) {
    throw new Error(
      "No Redis connection configured. Add an Upstash Redis integration in your Vercel project " +
        "(or set KV_REST_API_URL / KV_REST_API_TOKEN env vars) so games can be saved. " +
        "See README.md for setup instructions."
    );
  }
}

// The demo board is never persisted: every visitor gets a fresh copy of the
// original, and writes to it are dropped so nobody can change it for others.
export async function getGame(id: string): Promise<Game | null> {
  if (id === DEMO_GAME_ID) return buildDemoGame();
  assertPersistenceAvailable();
  if (redis) {
    const game = await redis.get<Game>(`game:${id}`);
    return game ?? null;
  }
  const all = await readFileStore();
  return all[id] ?? null;
}

export async function saveGame(game: Game): Promise<void> {
  if (game.id === DEMO_GAME_ID) return;
  assertPersistenceAvailable();
  if (redis) {
    await redis.set(`game:${game.id}`, game);
    return;
  }
  const all = await readFileStore();
  all[game.id] = game;
  await writeFileStore(all);
}

// Writes a timestamp so the Upstash database registers activity and isn't
// removed for inactivity on the free tier. No-op without Redis.
export async function pingStore(): Promise<string | null> {
  if (!redis) return null;
  const now = new Date().toISOString();
  await redis.set("keepalive", now);
  return now;
}

export function isUsingRedis(): boolean {
  return hasRedis;
}
