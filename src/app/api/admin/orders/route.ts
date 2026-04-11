import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const orders = await Order.find({})
      .populate("listingId", "title")
      .populate("renterId", "name email")
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
