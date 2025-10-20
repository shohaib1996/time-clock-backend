import { Request, Response } from "express";
import TimeLog from "../models/TimeLog.model";
import Employee from "../models/Employee.model";

const calculateHours = (clockIn: Date, clockOut: Date): number => {
  const diff = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
  return Math.round(diff * 100) / 100;
};

// 🕐 Employee Clock In
export const clockIn = async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body;
    const employee = await Employee.findOne({ _id: employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Verify password
    if (employee.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Check if already clocked in
    const activeLog = await TimeLog.findOne({ employee: employee._id, clockOut: null });
    if (activeLog) return res.status(400).json({ error: "Already clocked in" });

    employee.isActive = true;
    await employee.save();

    const newLog = await TimeLog.create({
      employee: employee._id,
      clockIn: new Date(),
    });

    res.json({ message: "Clocked in successfully", log: newLog });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 🕓 Employee Clock Out
export const clockOut = async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body;
    const employee = await Employee.findOne({ _id: employeeId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Verify password
    if (employee.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const log = await TimeLog.findOne({ employee: employee._id, clockOut: null });
    if (!log) return res.status(400).json({ error: "No active session" });

    const clockOutTime = new Date();
    const hours = calculateHours(log.clockIn, clockOutTime);
    const pay = hours * employee.hourlyRate;

    log.clockOut = clockOutTime;
    log.totalHours = hours;
    log.payAmount = pay;

    await log.save();

    employee.isActive = false;
    await employee.save();

    res.json({ message: "Clocked out successfully", log });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Get Employee Logs
export const getEmployeeLogs = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Fetch employee logs
    const logs = await TimeLog.find({ employee: employee._id }).sort({ clockIn: -1 });

    // Respond with details
    return res.status(200).json({
      success: true,
      message: `Successfully retrieved ${logs.length} log(s) for employee ${employee.name}`,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
      },
      totalLogs: logs.length,
      logs,
    });
  } catch (err: any) {
    console.error("Error fetching employee logs:", err.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving employee logs",
      error: err.message,
    });
  }
};

