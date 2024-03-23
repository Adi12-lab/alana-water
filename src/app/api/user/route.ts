import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { Auth } from "~/schema";
import { prismaInstance } from "~/lib/prisma";

export async function POST(req: NextRequest) {
  const payload: Auth = await req.json();
  const { username, password } = payload;
  if (!username || !password) {
    return NextResponse.json({ status: 400, message: "Payload tidak valid" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await prismaInstance.users.create({
    data: {
      username,
      password: hashPassword,
    },
  });
  return NextResponse.json({ status: 200, payload: { ...newUser } });
}

export async function GET() {
    const users = await prismaInstance.users.findMany();
    return NextResponse.json({ status: 200, payload: { ...users } });
}

