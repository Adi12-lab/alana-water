import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routes } from "./constant";

export async function middleware(request: NextRequest) {
  const access_token = request.cookies.get("access_token");
  if (routes.protected.includes(request.nextUrl.pathname)) {
    if (!access_token) {
      return NextResponse.redirect(new URL("/login", process.env.DOMAIN_URL));
    } else {
      const isLogin = await fetch(process.env.DOMAIN_URL + "/auth/is-auth", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          access_token,
        }),
      });
      if (!isLogin.ok) {
        return NextResponse.redirect(new URL("/login", process.env.DOMAIN_URL));
      }
      return NextResponse.next();
    }
  }
}

export const config = {
  matcher: ["/:path*"],
};
