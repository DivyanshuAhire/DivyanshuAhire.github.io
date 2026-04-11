import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password, phone, address } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "USER",
      phone,
      address,
    });

    const token = signToken({ id: user._id, role: user.role, email: user.email });

    const response = NextResponse.json(
      { message: "Registration successful", user: { id: user._id, email: user.email, role: user.role, name: user.name } },
      { status: 201 }
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
