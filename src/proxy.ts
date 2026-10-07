import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate only: bounce visitors without a session cookie to /login.
// Pages still validate the session against the database (requireSession).
export function proxy(request: NextRequest) {
  if (!request.cookies.has("cs_session")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/discover/:path*", "/recreate/:path*", "/track/:path*", "/settings/:path*"],
};
