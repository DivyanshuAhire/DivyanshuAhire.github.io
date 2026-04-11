import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user || user.password && !(await bcrypt.compare(password, user.password))) {
       return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({ id: user._id, role: user.role, email: user.email });

    const response = NextResponse.json(
      { message: "Login successful", user: { id: user._id, email: user.email, role: user.role, name: user.name } },
      { status: 200 }
    );
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
