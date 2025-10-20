import express from "express";
import { clockIn, clockOut, getEmployeeLogs } from "../controllers/timeLogController";

const router = express.Router();

router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/:employeeId", getEmployeeLogs);

export default router;
