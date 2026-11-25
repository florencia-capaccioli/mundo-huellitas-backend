import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";

import usersRoutes from "./routes/usersRoutes.js";
import animalesRoutes from "./routes/animalesRoutes.js";
import posteosRoutes from "./routes/posteosRoutes.js";
import imagenesRoutes from './routes/imagenesRoutes.js';

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json({ limit: "12mb" }));

app.use("/api/users", usersRoutes);
app.use("/api/animales", animalesRoutes);
app.use("/api/posteos", posteosRoutes);
app.use("/api/imagenes", imagenesRoutes)

app.get("/", (req, res) => {
    res.send("API funcionando 🚀");
});

app.use((req, res) => {
    res.status(404).json({ error: "Recurso no encontrado" });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: "Error interno del servidor"
    });
});

export default app;