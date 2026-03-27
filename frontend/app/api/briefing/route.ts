import { NextResponse } from "next/server";

export async function GET() {
  // R2_URL is the public Cloudflare R2 URL — intentionally public (no auth needed to read).
  // Use R2_URL (not NEXT_PUBLIC_R2_URL) so it stays server-side only and isn't baked into the client bundle.
  const url = process.env.R2_URL;

  if (!url) {
    return NextResponse.json(
      { error: "R2_URL is not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream error: HTTP ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
