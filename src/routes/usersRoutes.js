import express from "express";
import { registerUserController, loginUserController, updateRefugioProfileController } from "../controller/usersController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.put("/profile", authMiddleware, updateRefugioProfileController);

export default router;
