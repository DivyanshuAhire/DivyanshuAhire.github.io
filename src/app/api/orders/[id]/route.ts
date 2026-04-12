import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const order = await Order.findById(resolvedParams.id)
       .populate("listingId", "title images pricePerDay deposit")
       .populate("renterId", "name email phone")
       .populate("ownerId", "name email phone");
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();
    
    // Auto-update deposit and earning status if order becomes "Completed"
    if (body.status === "Completed") {
      body.depositRefundStatus = "Available";
      body.ownerEarningStatus = "Available";
    }

    const order = await Order.findByIdAndUpdate(resolvedParams.id, body, { new: true });
    return NextResponse.json({ message: "Order updated", order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
