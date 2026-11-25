import { registerUser, findUserByCredentials, updateRefugioProfile, updateCuenta, findRefugiosPublicos, listarFavoritos, agregarFavorito, quitarFavorito } from "../data/usersData.js";

export const registerUserService = async ({ nombre, email, password, rol, telefono }) => {
    try {
        return await registerUser({ nombre, email, password, rol, telefono });
    } catch (error) {
        if (error.message === "El email ya está registrado") {
            // Re-lanzar para que el controller lo maneje
            throw error;
        }

        throw new Error("Error al registrar el usuario");
    }
};

export const loginUserService = async ({ email, password }) => {
    const user = await findUserByCredentials(email, password);

    if (!user) {
        throw new Error("Credenciales inválidas");
    }

    // No devolver password
    const { password: _pw, ...userWithoutPassword } = user;

    return userWithoutPassword;
};

// Completa el perfil de un refugio
export const updateRefugioProfileService = async (userId, { ubicacion, telefono, latitude, longitude }) => {
    try {
        const result = await updateRefugioProfile(userId, { ubicacion, telefono, latitude, longitude });

        if (result.matchedCount === 0) {
            throw new Error("Usuario no encontrado");
        }

        return result;
    } catch (error) {
        if (error.message === "Usuario no encontrado") {
            throw error;
        }

        throw new Error("Error al actualizar el perfil del refugio");
    }
};

export const updateCuentaService = async (userId, { nombre, telefono }) => {
    const result = await updateCuenta(userId, { nombre, telefono });

    if (result.matchedCount === 0) {
        throw new Error("Usuario no encontrado");
    }

    return { nombre, telefono: telefono || "" };
};

export const listRefugiosService = async () => {
    return findRefugiosPublicos();
};

export const listFavoritosService = async (userId) => {
    return listarFavoritos(userId);
};

export const agregarFavoritoService = async (userId, animalId) => {
    return agregarFavorito(userId, animalId);
};

export const quitarFavoritoService = async (userId, animalId) => {
    return quitarFavorito(userId, animalId);
};
