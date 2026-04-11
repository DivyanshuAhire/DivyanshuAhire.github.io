import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Listing } from "@/models/Listing";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const listing = await Listing.findById(resolvedParams.id).populate("ownerId", "name email phone");
    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(listing, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const body = await req.json();
    const resolvedParams = await params;
    const updatedListing = await Listing.findByIdAndUpdate(resolvedParams.id, body, { new: true });
    return NextResponse.json({ message: "Listing updated", listing: updatedListing }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    await Listing.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ message: "Listing deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
