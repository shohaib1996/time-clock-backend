import express from "express";
import { createPayment, getEmployeePayments, getUnpaidLogsByPeriod } from "../controllers/paymentController";

const router = express.Router();

router.post("/", createPayment);
router.get("/mine/:employeeId", getEmployeePayments);
router.get("/unpaid", getUnpaidLogsByPeriod);

export default router;
