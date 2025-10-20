import express from "express";
import { employeeLogin, adminLogin, createAdmin } from "../controllers/authController";

const router = express.Router();

router.post("/employee", employeeLogin);
router.post("/admin", adminLogin);
router.post("/register-admin", createAdmin); 

export default router;
