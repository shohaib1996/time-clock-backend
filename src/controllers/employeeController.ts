import { Request, Response } from "express";
import Employee from "../models/Employee.model";

// 🧾 Get all employees (Admin)
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "✅ Successfully retrieved all employees",
      totalEmployees: employees.length,
      data: employees,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch employees",
      error: err.message,
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `❌ Employee not found with ID: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Employee details retrieved successfully",
      data: employee,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch employee",
      error: err.message,
    });
  }
};


// ➕ Add new employee (Admin)
export const addEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, password, hourlyRate } = req.body;

    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const employee = await Employee.create({
      name,
      email,
      password,
      hourlyRate,
    });

    res.status(201).json(employee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ✏️ Update employee info (Admin)
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ❌ Delete employee (Admin)
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee removed successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 👤 Get employee profile (for their own dashboard)
export const getEmployeeProfile = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.json({
      name: employee.name,
      email: employee.email,
      hourlyRate: employee.hourlyRate
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
