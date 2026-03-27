import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("briefing_token")?.value;
  const secret = process.env.BRIEFING_SECRET;

  const isValid = Boolean(secret && token === secret);

  const response = NextResponse.next();

  if (!isValid) {
    response.headers.set("x-demo-mode", "true");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
