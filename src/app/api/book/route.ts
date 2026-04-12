import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Listing } from "@/models/Listing";
import { Order } from "@/models/Order";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123";

export function getDatesBetween(startDate: Date, endDate: Date) {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    let renterId: string;
    try {
       const secret = new TextEncoder().encode(JWT_SECRET);
       const { payload } = await jwtVerify(token, secret);
       renterId = payload.id as string;
    } catch {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, startDate, endDate, deliveryType } = body as { listingId: string, startDate: string, endDate: string, deliveryType: string };
    const listing = await Listing.findById(listingId);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const requestedDates = getDatesBetween(new Date(startDate), new Date(endDate));
    
    // Check double booking
    const isBooked = listing.availabilityDates.some((bookedDate: Date) => 
      requestedDates.some(reqDate => new Date(bookedDate).toDateString() === reqDate.toDateString())
    );

    if (isBooked) {
      return NextResponse.json({ error: "Listing is not available for requested dates" }, { status: 400 });
    }

    const numberOfDays = requestedDates.length;
    const baseRentalPrice = listing.pricePerDay * numberOfDays;
    
    const platformFee = Math.round(baseRentalPrice * 0.15);
    const ownerEarning = baseRentalPrice - platformFee;
    const totalPrice = baseRentalPrice + listing.deposit;
    const securityDeposit = listing.deposit;

    const order = await Order.create({
      listingId,
      renterId,
      ownerId: listing.ownerId,
      startDate,
      endDate,
      totalPrice,
      platformFee,
      ownerEarning,
      securityDeposit,
      deliveryType: deliveryType || "Pickup",
      status: "Pending",
      paymentStatus: "Pending",
      ownerEarningStatus: "Pending"
    });

    return NextResponse.json({ message: "Booking initiated", order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
