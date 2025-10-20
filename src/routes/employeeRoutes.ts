import express from "express";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeProfile,
  getEmployeeById,
} from "../controllers/employeeController";

const router = express.Router();

// Admin endpoints
router.get("/", getEmployees);
router.get("/:id", getEmployeeById)
router.post("/", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

// Employee dashboard endpoint
router.get("/profile/:employeeId", getEmployeeProfile);

export default router;
