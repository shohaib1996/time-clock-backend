import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.model";
import Admin from "../models/Admin.model";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

// 🧍 Employee Login
export const employeeLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email, password });
    if (!employee) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(String(employee._id));
    res.json({
      token,
      user: {
        id: String(employee._id),
        name: employee.name,
        email: employee.email,
        role: "employee",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 👨‍💼 Admin Login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, password });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(String(admin._id));
    res.json({
      token,
      user: {
        id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role || "admin",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 🆕 Create Admin (for first-time setup or testing)
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ error: "Admin with this email already exists" });

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "admin",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      user: {
        id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
