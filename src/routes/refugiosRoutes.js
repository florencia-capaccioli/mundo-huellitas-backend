import express from "express";
import { registerRefugioController, loginRefugioController } from "../controller/refugiosController.js";

const router = express.Router();

router.post("/register", registerRefugioController);
router.post("/login", loginRefugioController);

export default router;
