import express from "express";
import { registerAdoptanteController, loginAdoptanteController } from "../controller/adoptantesController.js";

const router = express.Router();

router.post("/register", registerAdoptanteController);
router.post("/login", loginAdoptanteController);

export default router;
