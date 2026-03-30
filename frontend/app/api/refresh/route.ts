import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.CLOUD_FUNCTION_URL;
  if (!url) {
    return NextResponse.json(
      { success: false, error: "CLOUD_FUNCTION_URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
