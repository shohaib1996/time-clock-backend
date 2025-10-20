import { Request, Response } from "express";
import Employee from "../models/Employee.model";
import TimeLog from "../models/TimeLog.model";
import Payment from "../models/Payment.model";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // 1. Total Employees
    const totalEmployees = await Employee.countDocuments();

    // 2. Total Active Employees
    const totalActiveEmployees = await Employee.countDocuments({ isActive: true });

    // 3. Employees Clocked In
    const employeesClockedIn = await TimeLog.countDocuments({ clockOut: null });

    // 4. Total Hours Logged (Current Month)
    const monthlyHours = await TimeLog.aggregate([
      { $match: { clockIn: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $group: { _id: null, totalHours: { $sum: "$totalHours" } } },
    ]);
    const totalHoursThisMonth = monthlyHours.length > 0 ? monthlyHours[0].totalHours : 0;

    // 4. Total Payments (Current Month)
    const monthlyPayments = await Payment.aggregate([
      { $match: { payDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalPaymentsThisMonth = monthlyPayments.length > 0 ? monthlyPayments[0].totalAmount : 0;

    // 5. Pending Payments
    const pendingPayments = await TimeLog.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, totalAmount: { $sum: "$payAmount" } } },
    ]);
    const totalPendingPayments = pendingPayments.length > 0 ? pendingPayments[0].totalAmount : 0;

    // 6. New Employees (Current Month)
    const newEmployeesThisMonth = await Employee.countDocuments({
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    });

    // Chart Data
    // Pie Chart: Employee Status
    const clockedOutEmployees = totalActiveEmployees - employeesClockedIn;
    const employeeStatusChart = [
      { name: "Clocked In", value: employeesClockedIn },
      { name: "Clocked Out", value: clockedOutEmployees },
    ];

    // Bar Chart: Monthly Payments (Last 6 Months)
    const monthlyPaymentsChart = await Payment.aggregate([
      { $match: { payDate: { $gte: new Date(new Date().setMonth(today.getMonth() - 6)) } } },
      {
        $group: {
          _id: { $month: "$payDate" },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Line Chart: Recent Hours Logged (Last 7 Days)
    const recentHoursChart = await TimeLog.aggregate([
        { $match: { clockIn: { $gte: new Date(new Date().setDate(today.getDate() - 7)) } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$clockIn" } },
                totalHours: { $sum: "$totalHours" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Doughnut Chart: Top 5 Paid Employees (Current Month)
    const topPaidEmployeesChart = await Payment.aggregate([
        { $match: { payDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
        {
            $group: {
                _id: "$employee",
                totalAmount: { $sum: "$amount" }
            }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "employees",
                localField: "_id",
                foreignField: "_id",
                as: "employee"
            }
        },
        { $unwind: "$employee" },
        {
            $project: {
                _id: 0,
                name: "$employee.name",
                totalAmount: 1
            }
        }
    ]);


    res.json({
      stats: {
        totalEmployees,
        totalActiveEmployees,
        employeesClockedIn,
        totalHoursThisMonth,
        totalPaymentsThisMonth,
        totalPendingPayments,
        newEmployeesThisMonth,
      },
      charts: {
        employeeStatusChart,
        monthlyPaymentsChart,
        recentHoursChart,
        topPaidEmployeesChart,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
