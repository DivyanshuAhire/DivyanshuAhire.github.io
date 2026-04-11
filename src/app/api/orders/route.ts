import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id;
    const role = payload.role;

    let query: any = {};
    if (role === "USER") {
       query = { $or: [{ renterId: userId }, { ownerId: userId }] };
    } else if (role === "ADMIN") {
       // Admins see all
    }

    const orders = await Order.find(query)
      .populate("listingId", "title images location")
      .populate("renterId", "name email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
