import { NextRequest, NextResponse } from "next/server";
import { pingStore } from "@/lib/store";

// Called daily by Vercel Cron (see vercel.json). When CRON_SECRET is set,
// Vercel sends it as a bearer token, so reject anything else.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pingedAt = await pingStore();
    if (!pingedAt) {
      return NextResponse.json({ ok: false, error: "Redis not configured" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, pingedAt });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Ping failed" },
      { status: 500 }
    );
  }
}
