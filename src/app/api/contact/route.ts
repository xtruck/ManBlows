const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const field = (key: string, max: number) =>
    typeof body[key] === "string" ? (body[key] as string).trim().slice(0, max) : "";

  // Honeypot: bots fill the hidden "company" field; pretend success.
  if (field("company", 200)) return Response.json({ ok: true });

  const name = field("name", 120);
  const email = field("email", 200);
  const message = field("message", 4000);
  if (!name || !EMAIL.test(email) || !message) {
    return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  // TODO: deliver by email (e.g. Resend) once the client's address is confirmed.
  console.info("[contact] new request", {
    name,
    email,
    type: field("type", 80),
    date: field("date", 40),
    length: message.length,
  });

  return Response.json({ ok: true });
}
