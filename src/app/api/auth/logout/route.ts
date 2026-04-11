import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = NextResponse.json({ message: "Logout successful" });
  response.cookies.set("auth-token", "", { maxAge: 0, path: "/" });
  return response;
}
