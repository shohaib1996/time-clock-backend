import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  employee: mongoose.Types.ObjectId;
  amount: number;
  payDate: Date;
  periodStart: Date;
  periodEnd: Date;
  status: "paid" | "pending";
}

const paymentSchema = new Schema<IPayment>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    amount: { type: Number, required: true },
    payDate: { type: Date, default: Date.now },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: { type: String, enum: ["paid", "pending"], default: "paid" },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", paymentSchema);
