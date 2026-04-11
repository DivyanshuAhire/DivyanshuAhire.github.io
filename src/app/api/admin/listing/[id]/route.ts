import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Listing } from "@/models/Listing";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    await Listing.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ message: "Listing deleted by Admin" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
