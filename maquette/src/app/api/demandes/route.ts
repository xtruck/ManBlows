import { NextResponse } from "next/server";
import { isFormKind, validate } from "@/lib/forms";

/**
 * Receives form requests. In this mockup nothing is stored or forwarded: the data is
 * validated and acknowledged. See README › "Brancher les formulaires" to connect an
 * e-mail service or a spreadsheet once the establishment has agreed.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Trop de demandes, réessayez dans une minute." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !isFormKind(body.kind)) {
    return NextResponse.json({ ok: false, error: "Type de demande inconnu." }, { status: 400 });
  }

  const result = validate(body.kind, body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  const reference = `DEMO-${body.kind.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  // Personal data is deliberately not logged.
  console.info(`[demande] ${body.kind} ${reference} (mode démonstration, non transmise)`);
  return NextResponse.json({ ok: true, reference, mode: "demo" });
}
