import express from "express";
import { subir, listar, obtenerUrl, subirLocal, subirLocalMiddleware, subirDesdeBase64 } from "../controller/imagenesController.js";

const imagenRouter = express.Router();

imagenRouter.post("/local-json", subirDesdeBase64);
imagenRouter.post("/local", (req, res, next) => {
    subirLocalMiddleware(req, res, (error) => {
        if (error) {
            return res.status(400).json({ message: error.message || "No se pudo guardar la foto" });
        }
        return subirLocal(req, res);
    });
});
imagenRouter.post("/", express.raw({ type: "image/*", limit: "10mb" }), subir);
imagenRouter.get("/", listar);
imagenRouter.get("/:nombre", obtenerUrl);

export default imagenRouter;