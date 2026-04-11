import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
