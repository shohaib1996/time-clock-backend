import { Request, Response } from "express";
import Payment from "../models/Payment.model";
import TimeLog from "../models/TimeLog.model";

// 💸 Admin pays employee
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { employeeId, periodStart, periodEnd } = req.body;

    const parsedStartDate = new Date(`${periodStart}T00:00:00.000Z`);
    const parsedEndDate = new Date(`${periodEnd}T23:59:59.999Z`);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD." });
    }

    const logs = await TimeLog.find({
      employee: employeeId,
      status: "pending",
      clockIn: { $gte: parsedStartDate, $lte: parsedEndDate },
    });

    if (logs.length === 0) {
      return res.status(400).json({ message: "No pending payments for this period." });
    }

    const totalAmount = logs.reduce((acc, log) => acc + (log.payAmount || 0), 0);

    const payment = await Payment.create({
      employee: employeeId,
      amount: totalAmount,
      periodStart: parsedStartDate,
      periodEnd: parsedEndDate,
      status: "paid",
    });

    await TimeLog.updateMany(
      { _id: { $in: logs.map((log) => log._id) } },
      { $set: { status: "paid" } }
    );

    res.status(201).json({ message: "Payment successful", payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// 👤 Employee views their own payments
export const getEmployeePayments = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const payments = await Payment.find({ employee: employeeId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Get unpaid logs by period
export const getUnpaidLogsByPeriod = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    const parsedStartDate = new Date(`${startDate}T00:00:00.000Z`);
    const parsedEndDate = new Date(`${endDate}T23:59:59.999Z`);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD." });
    }

    const logs = await TimeLog.find({
      employee: employeeId,
      status: "pending",
      clockIn: { $gte: parsedStartDate, $lte: parsedEndDate },
    });

    const totalAmount = logs.reduce((acc, log) => acc + (log.payAmount || 0), 0);

    res.json({ logs, totalAmount, startDate, endDate });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
