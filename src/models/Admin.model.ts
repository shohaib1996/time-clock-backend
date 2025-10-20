import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: string
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", adminSchema);
