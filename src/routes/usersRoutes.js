import express from "express";
import { registerUserController, loginUserController, updateRefugioProfileController, updateCuentaController, listRefugiosController, listFavoritosController, agregarFavoritoController, quitarFavoritoController } from "../controller/usersController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.get("/refugios", listRefugiosController);
router.put("/profile", authMiddleware, updateRefugioProfileController);
router.put("/cuenta", authMiddleware, updateCuentaController);
router.get("/favoritos", authMiddleware, listFavoritosController);
router.post("/favoritos/:idAnimal", authMiddleware, agregarFavoritoController);
router.delete("/favoritos/:idAnimal", authMiddleware, quitarFavoritoController);

export default router;
