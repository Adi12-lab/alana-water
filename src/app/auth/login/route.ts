import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { Auth } from "~/schema";
import { prismaInstance } from "~/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload: Auth = await req.json();
    const { username, password } = payload;

    if (!username || !password) {
      return NextResponse.json({ status: 400, message: "Login tidak valid" });
    }

    const findUser = await prismaInstance.users.findUnique({
      where: {
        username,
      },
    });

    if (!findUser) {
      return NextResponse.json({
        status: 401,
        message: "Username tidak ditemukan",
      });
    }

    const match = await bcrypt.compare(password, findUser.password);

    if (!match) {
      return NextResponse.json({ status: 401, message: "Password salah" });
    }
    const login = jwt.sign({ username }, process.env.SECRET_KEY as string);
    cookies().set("access_token", login);
    return NextResponse.json({ status: 200, message: "Login berhasil" });
  } catch (err) {
    return NextResponse.json({ status: 500, message: "[POST_LOGIN] " + err });
  }
}
