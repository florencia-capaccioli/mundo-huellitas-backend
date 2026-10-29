import express from "express";
import morgan from "morgan";
import cors from "cors";
import adoptantesRoutes from "./routes/adoptantesRoutes.js";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use("/api/adoptantes", adoptantesRoutes);

app.get("/", (req, res) => {
    res.send("API funcionando 🚀");
});

app.use((req, res) => {
    res.status(404).json({ error: "Recurso no encontrado" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
});

export default app;
