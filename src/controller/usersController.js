import { registerUserService, loginUserService, updateRefugioProfileService } from "../service/usersService.js";
import jwt from "jsonwebtoken";

export const registerUserController = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ message: "Faltan campos obligatorios (nombre, email, password, rol)" });
    }

    if (typeof rol !== "string") {
        return res.status(400).json({ message: "Rol inválido" });
    }

    const rolNormalizado = rol.trim().toLowerCase();

    if (!["adoptante", "refugio"].includes(rolNormalizado)) {
        return res.status(400).json({ message: "Rol inválido" });
    }

    try {
        const result = await registerUserService({ nombre, email, password, rol: rolNormalizado });

        const token = jwt.sign(
            {
                id: result.insertedId,
                nombre,
                email,
                rol: rolNormalizado
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(201).json({ message: "Usuario registrado exitosamente", userId: result.insertedId, token });
    } catch (error) {
        if (error.message === "El email ya está registrado") {
            return res.status(409).json({ message: error.message });
        }

        console.log("Error registrando usuario: ", error);

        res.status(500).json({ message: "Error interno al registrar usuario" });
    }
};

export const loginUserController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios (email, password)" });
    }

    try {
        const user = await loginUserService({ email, password });
        const token = jwt.sign(
            {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );
        res.json({ message: "Login exitoso", user, token });
    } catch (error) {
        if (error.message === "Credenciales inválidas") {
            return res.status(401).json({ message: error.message });
        }

        console.log("Error en login: ", error);

        res.status(500).json({ message: "Error interno en login" });
    }
};

// Completa el perfil de un refugio
export const updateRefugioProfileController = async (req, res) => {
    const { ubicacion, telefono } = req.body;

    if (!ubicacion || !telefono) {
        return res.status(400).json({ message: "Faltan campos obligatorios (ubicacion, telefono)" });
    }

    if (req.user.rol !== "refugio") {
        return res.status(403).json({ message: "Solo los refugios pueden completar este perfil" });
    }

    try {
        await updateRefugioProfileService(req.user.id, { ubicacion, telefono });

        res.json({ message: "Perfil del refugio actualizado exitosamente" });
    } catch (error) {
        if (error.message === "Usuario no encontrado") {
            return res.status(404).json({ message: error.message });
        }

        console.log("Error actualizando perfil del refugio: ", error);

        res.status(500).json({ message: "Error interno al actualizar el perfil" });
    }
};
