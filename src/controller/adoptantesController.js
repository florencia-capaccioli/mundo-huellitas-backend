import { registerAdoptanteService, loginAdoptanteService } from "../service/adoptantesService.js";
import jwt from "jsonwebtoken";

export const registerAdoptanteController = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios (username, email, password)" });
    }

    try {
        const result = await registerAdoptanteService({ username, email, password });
        res.status(201).json({ message: "Adoptante registrado exitosamente", adoptanteId: result.insertedId });
    } catch (error) {
        if (error.message === "El email ya está registrado") {
            return res.status(409).json({ message: error.message });
        }

        console.log("Error registrando adoptante: ", error);

        res.status(500).json({ message: "Error interno al registrar adoptante" });
    }
};

export const loginAdoptanteController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios (email, password)" });
    }

    try {
        const adoptante = await loginAdoptanteService({ email, password });
        const token = jwt.sign(
            {
                _id: adoptante._id,
                username: adoptante.username,
                email: adoptante.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );
        res.json({ message: "Login exitoso", adoptante, token });
    } catch (error) {
        if (error.message === "Credenciales inválidas") {
            return res.status(401).json({ message: error.message });
        }

        console.log("Error en login: ", error);

        res.status(500).json({ message: "Error interno en login" });
    }
};
