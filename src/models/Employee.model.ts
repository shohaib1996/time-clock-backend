import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  email: string;
  password: string;
  hourlyRate: number;
  isActive: boolean;
  role: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      default: "1234", // ✅ default password
      validate: {
        validator: function (value: string) {
          // ✅ must be exactly 4 digits (0–9)
          return /^[0-9]{4}$/.test(value);
        },
        message: "Password must be exactly 4 digits",
      },
    },
    hourlyRate: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    role: { type: String, required: true, default: "employee" },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>("Employee", employeeSchema);
