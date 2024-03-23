import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    cookies().delete("access_token");
    return NextResponse.json({ status: 200, message: "Logout berhasil" });
  } catch (err) {
    return NextResponse.json({ status: 500, message: "[POST_LOGOUT] " + err });
  }
}
