import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const orders = await Order.find({ paymentStatus: "Paid" });
    const totalProfits = orders.reduce((sum, order) => sum + order.platformFee, 0);
    return NextResponse.json({ totalProfits, orderCount: orders.length }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
