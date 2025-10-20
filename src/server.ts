import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db"; // ✅ relative path fixed (no need for ../src)
import authRoutes from "./routes/authRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import timeLogRoutes from "./routes/timeLogRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

dotenv.config();

const app: Application = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Health check route
app.get("/", (req: Request, res: Response) => {
  res.send("⏱️ Time Clock API running with TypeScript + MongoDB 🚀");
});

// ✅ Register routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/time", timeLogRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
