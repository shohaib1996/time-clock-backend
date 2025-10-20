import express from "express";
import { employeeLogin, adminLogin, createAdmin, changePassword } from "../controllers/authController";

const router = express.Router();

router.post("/employee", employeeLogin);
router.post("/admin", adminLogin);
router.post("/register-admin", createAdmin); 
router.post("/change-password", changePassword);

export default router;
