import { Request, Response } from "express";
import mongoose from "mongoose";
import Employee from "../models/Employee.model";
import TimeLog from "../models/TimeLog.model";
import Payment from "../models/Payment.model";

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
    const employee = await Employee.findOne({ _id: employeeId });
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

//  Dashboard data for a single employee
export const getEmployeeDashboardData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employeeId = new mongoose.Types.ObjectId(id);

    // 1. Total Hours Worked
    const totalHoursResult = await TimeLog.aggregate([
      { $match: { employee: employeeId } },
      { $group: { _id: null, totalHours: { $sum: "$totalHours" } } },
    ]);
    const totalHoursWorked = totalHoursResult.length > 0 ? totalHoursResult[0].totalHours : 0;

    // 2. Total Paid
    const totalPaidResult = await Payment.aggregate([
      { $match: { employee: employeeId } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].totalAmount.toFixed(2) : 0;

    // 3. Pending Payments
    const pendingPaymentsResult = await TimeLog.aggregate([
      { $match: { employee: employeeId, status: "pending" } },
      { $group: { _id: null, totalAmount: { $sum: "$payAmount" } } },
    ]);
    const pendingPayments = pendingPaymentsResult.length > 0 ? pendingPaymentsResult[0].totalAmount : 0;

    // 4. All Time Logs
    const timeLogs = await TimeLog.find({ employee: employeeId }).sort({ clockIn: -1 });

    res.json({
      stats: {
        totalHoursWorked,
        totalPaid,
        pendingPayments,
      },
      timeLogs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
