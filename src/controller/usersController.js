import { registerUserService, loginUserService, updateRefugioProfileService, updateCuentaService, listRefugiosService, listFavoritosService, agregarFavoritoService, quitarFavoritoService } from "../service/usersService.js";
import jwt from "jsonwebtoken";

const digitosTelefono = (telefono) => String(telefono || "").replace(/\D/g, "");

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

    const telefono = digitosTelefono(req.body.telefono);

    if (rolNormalizado === "refugio" && !telefono) {
        return res.status(400).json({ message: "Los refugios deben cargar un teléfono." });
    }

    if (telefono && telefono.length <= 8) {
        return res.status(400).json({ message: "El teléfono debe tener más de 8 dígitos." });
    }

    try {
        const result = await registerUserService({
            nombre,
            email,
            password,
            rol: rolNormalizado,
            telefono
        });

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
const coordenadaValida = (valor, min, max) => {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero >= min && numero <= max;
};

export const updateRefugioProfileController = async (req, res) => {
    const { ubicacion, telefono, latitude, longitude } = req.body;

    if (!ubicacion || !telefono) {
        return res.status(400).json({ message: "Faltan campos obligatorios (ubicacion, telefono)" });
    }

    const enviaCoordenadas = latitude != null || longitude != null;

    if (enviaCoordenadas && (
        !coordenadaValida(latitude, -90, 90) ||
        !coordenadaValida(longitude, -180, 180)
    )) {
        return res.status(400).json({ message: "Latitud o longitud inválida" });
    }

    if (req.user.rol !== "refugio") {
        return res.status(403).json({ message: "Solo los refugios pueden completar este perfil" });
    }

    try {
        await updateRefugioProfileService(req.user.id, {
            ubicacion,
            telefono,
            latitude: enviaCoordenadas ? Number(latitude) : undefined,
            longitude: enviaCoordenadas ? Number(longitude) : undefined
        });

        res.json({ message: "Perfil del refugio actualizado exitosamente" });
    } catch (error) {
        if (error.message === "Usuario no encontrado") {
            return res.status(404).json({ message: error.message });
        }

        console.log("Error actualizando perfil del refugio: ", error);

        res.status(500).json({ message: "Error interno al actualizar el perfil" });
    }
};

export const updateCuentaController = async (req, res) => {
    const nombre = String(req.body.nombre || "").trim();
    const telefono = digitosTelefono(req.body.telefono);

    if (!nombre) {
        return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    if (req.user.rol === "refugio" && !telefono) {
        return res.status(400).json({ message: "Los refugios deben cargar un teléfono." });
    }

    if (telefono && telefono.length <= 8) {
        return res.status(400).json({ message: "El teléfono debe tener más de 8 dígitos." });
    }

    try {
        const cuenta = await updateCuentaService(req.user.id, { nombre, telefono });
        res.json({ message: "Cuenta actualizada", ...cuenta });
    } catch (error) {
        if (error.message === "Usuario no encontrado") {
            return res.status(404).json({ message: error.message });
        }

        console.log("Error actualizando cuenta: ", error);
        res.status(500).json({ message: "Error interno al actualizar la cuenta" });
    }
};

export const listRefugiosController = async (req, res) => {
    try {
        const refugios = await listRefugiosService();
        res.json(refugios);
    } catch (error) {
        console.log("Error listando refugios: ", error);
        res.status(500).json({ message: "Error interno al listar refugios" });
    }
};

const responderFavoritos = (res, error) => {
    if (error.message === "Usuario no encontrado" || error.message === "Animal no encontrado") {
        return res.status(404).json({ message: error.message });
    }

    console.log("Error en favoritos: ", error);
    return res.status(500).json({ message: "Error interno al actualizar favoritos" });
};

export const listFavoritosController = async (req, res) => {
    try {
        const favoritos = await listFavoritosService(req.user.id);
        res.json({ favoritos });
    } catch (error) {
        responderFavoritos(res, error);
    }
};

export const agregarFavoritoController = async (req, res) => {
    try {
        const favoritos = await agregarFavoritoService(req.user.id, req.params.idAnimal);
        res.status(201).json({ favoritos });
    } catch (error) {
        responderFavoritos(res, error);
    }
};

export const quitarFavoritoController = async (req, res) => {
    try {
        const favoritos = await quitarFavoritoService(req.user.id, req.params.idAnimal);
        res.json({ favoritos });
    } catch (error) {
        responderFavoritos(res, error);
    }
};
