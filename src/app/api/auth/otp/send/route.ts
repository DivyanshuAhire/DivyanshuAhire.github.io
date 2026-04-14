import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { VerificationCode } from "@/models/VerificationCode";
import { sendWhatsAppOTP } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    await dbConnect();

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in DB (Upsert)
    await VerificationCode.findOneAndUpdate(
      { identifier: phone },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // Send via WhatsApp
    await sendWhatsAppOTP(phone, code);

    return NextResponse.json({ message: "OTP sent successfully via WhatsApp." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
