import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Secret } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const { access_token } = payload;
  if (!access_token) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }
  try {
    const decoded = jwt.verify(
      access_token.value,
      process.env.SECRET_KEY as Secret
    );
    return NextResponse.json(decoded);
  } catch (err) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 });
  }
}
