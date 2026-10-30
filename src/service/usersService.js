import { registerUser, findUserByCredentials, updateRefugioProfile } from "../data/usersData.js";

export const registerUserService = async ({ nombre, email, password, rol }) => {
    try {
        return await registerUser({ nombre, email, password, rol });
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
export const updateRefugioProfileService = async (userId, { ubicacion, telefono }) => {
    try {
        const result = await updateRefugioProfile(userId, { ubicacion, telefono });

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
