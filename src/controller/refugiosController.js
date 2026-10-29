import { registerRefugioService, loginRefugioService } from "../service/refugiosService.js";
import jwt from "jsonwebtoken";

export const registerRefugioController = async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios (nombre, email, password)" });
    }

    try {
        const result = await registerRefugioService({ nombre, email, password });
        res.status(201).json({ message: "Refugio registrado exitosamente", refugioId: result.insertedId });
    } catch (error) {
        if (error.message === "El email ya está registrado") {
            return res.status(409).json({ message: error.message });
        }

        console.log("Error registrando refugio: ", error);

        res.status(500).json({ message: "Error interno al registrar refugio" });
    }
};

export const loginRefugioController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios (email, password)" });
    }

    try {
        const refugio = await loginRefugioService({ email, password });
        const token = jwt.sign(
            {
                _id: refugio._id,
                nombre: refugio.nombre,
                email: refugio.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );
        res.json({ message: "Login exitoso", refugio, token });
    } catch (error) {
        if (error.message === "Credenciales inválidas") {
            return res.status(401).json({ message: error.message });
        }

        console.log("Error en login: ", error);

        res.status(500).json({ message: "Error interno en login" });
    }
};
