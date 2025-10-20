import mongoose, { Schema, Document } from "mongoose";

export interface ITimeLog extends Document {
  employee: mongoose.Types.ObjectId;
  clockIn: Date;
  clockOut?: Date;
  totalHours?: number;
  payAmount?: number;
  status: "pending" | "paid";
}

const timeLogSchema = new Schema<ITimeLog>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    totalHours: { type: Number },
    payAmount: { type: Number },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model<ITimeLog>("TimeLog", timeLogSchema);
