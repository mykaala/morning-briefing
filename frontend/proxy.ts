import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("briefing_token")?.value;
  const secret = process.env.BRIEFING_SECRET;

  const isValid = Boolean(secret && token === secret);

  const response = NextResponse.next();
  response.headers.set("x-demo-mode", isValid ? "false" : "true");
  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
