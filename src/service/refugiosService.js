import { registerRefugio, findRefugioByCredentials } from "../data/refugiosData.js";

export const registerRefugioService = async ({ nombre, email, password }) => {
    try {
        return await registerRefugio({ nombre, email, password });
    } catch (error) {
        if (error.message === "El email ya está registrado") {
            // Re-lanzar para que el controller lo maneje
            throw error;
        }

        throw new Error("Error al registrar el refugio");
    }
};

export const loginRefugioService = async ({ email, password }) => {
    const refugio = await findRefugioByCredentials(email, password);

    if (!refugio) {
        throw new Error("Credenciales inválidas");
    }

    // No devolver password
    const { password: _pw, ...refugioWithoutPassword } = refugio;

    return refugioWithoutPassword;
};
