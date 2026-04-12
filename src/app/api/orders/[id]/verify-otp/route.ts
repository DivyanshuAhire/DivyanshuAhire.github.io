import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    const body = await req.json();
    const { otp, phase } = body; // phase: 'pickup' | 'return'

    const order = await Order.findById(resolvedParams.id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (phase === "pickup") {
      // Logic for Pickup: Seller enters Buyer's OTP
      if (order.ownerId.toString() !== userId) {
        return NextResponse.json({ error: "Only the item owner can verify the pickup OTP." }, { status: 403 });
      }

      if (order.pickupOTP !== otp) {
        return NextResponse.json({ error: "Invalid Pickup OTP." }, { status: 400 });
      }

      order.status = "Delivered";
      order.ownerEarningStatus = "Available";
      order.pickupVerified = true;
    } else if (phase === "return") {
      // Logic for Return: Buyer enters Seller's OTP
      if (order.renterId.toString() !== userId) {
        return NextResponse.json({ error: "Only the renter can verify the return OTP." }, { status: 403 });
      }

      if (order.returnOTP !== otp) {
        return NextResponse.json({ error: "Invalid Return OTP." }, { status: 400 });
      }

      order.status = "Completed";
      order.depositRefundStatus = "Available";
      order.returnVerified = true;
    } else {
      return NextResponse.json({ error: "Invalid verification phase." }, { status: 400 });
    }

    await order.save();

    return NextResponse.json({ 
      message: `Verification successful! Order marked as ${order.status}.`,
      order 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
