import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  password?: string;
  role: "USER" | "ADMIN";
  phone: string;
  address?: string;
  walletBalance: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true },
    password: { type: String },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
