import { NextResponse } from "next/server";

const COOKIE_NAME = "briefing_token";
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export async function POST(request: Request) {
  const secret = process.env.BRIEFING_SECRET;

  if (!secret) {
    return NextResponse.json({ success: false, error: "not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (password !== secret) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, secret, {
    httpOnly: true,
    maxAge: MAX_AGE,
    sameSite: "strict",
    secure: true,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
