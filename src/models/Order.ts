import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  listingId: mongoose.Types.ObjectId;
  renterId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  platformFee: number;
  ownerEarning: number;
  securityDeposit: number;
  depositRefundStatus: "Pending" | "Available" | "Requested" | "Completed";
  status: "Pending" | "Accepted" | "Rejected" | "Ongoing" | "Delivered" | "Returned" | "Completed";
  paymentStatus: "Pending" | "Paid" | "Failed";
  deliveryType: "Pickup" | "Delivery";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  ownerEarningStatus: "Pending" | "Available" | "Requested" | "Completed";
  pickupOTP?: string;
  returnOTP?: string;
  pickupVerified: boolean;
  returnVerified: boolean;
}

const OrderSchema = new Schema<IOrder>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    renterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    ownerEarning: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    depositRefundStatus: {
      type: String,
      enum: ["Pending", "Available", "Requested", "Completed"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Ongoing", "Delivered", "Returned", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    deliveryType: {
      type: String,
      enum: ["Pickup", "Delivery"],
      default: "Pickup",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    ownerEarningStatus: {
      type: String,
      enum: ["Pending", "Available", "Requested", "Completed"],
      default: "Pending",
    },
    pickupOTP: { type: String },
    returnOTP: { type: String },
    pickupVerified: { type: Boolean, default: false },
    returnVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
