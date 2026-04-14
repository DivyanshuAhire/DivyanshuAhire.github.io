import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVerificationCode extends Document {
  identifier: string; // phone number
  code: string;
  createdAt: Date;
  expiresAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    identifier: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index to automatically delete expired codes
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationCode: Model<IVerificationCode> = 
  mongoose.models.VerificationCode || mongoose.model<IVerificationCode>("VerificationCode", VerificationCodeSchema);
