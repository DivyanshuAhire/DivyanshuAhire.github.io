import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, phone, password, address, email } = body;

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "USER",
      email,
      address,
    });

    const token = signToken({ id: user._id, role: user.role, phone: user.phone });

    const response = NextResponse.json(
      { message: "Registration successful", user: { id: user._id, phone: user.phone, role: user.role, name: user.name } },
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
