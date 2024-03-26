import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routes } from "./constant";


export async function middleware(request: NextRequest) {
  const access_token = request.cookies.get("access_token");
  if (!access_token && routes.protected.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", process.env.DOMAIN_URL));
  }
  
}

export const config = {
  matcher: ['/:path*']
}
